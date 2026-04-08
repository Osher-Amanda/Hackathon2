import { useEffect, useState } from "react";
import "./App.css";

function App() {
const [questions, setQuestions] = useState([]);
const [leaderboard, setLeaderboard] = useState([]);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [selectedAnswer, setSelectedAnswer] = useState("");
const [score, setScore] = useState(0);
const [quizFinished, setQuizFinished] = useState(false);
const [username, setUsername] = useState("");
const [quizStarted, setQuizStarted] = useState(false);
const [loading, setLoading] = useState(true);
const [feedback, setFeedback] = useState("");
const [timeLeft, setTimeLeft] = useState(15);
const [answerHistory, setAnswerHistory] = useState([]);

const currentQuestion = questions[currentQuestionIndex];
const progress = questions.length ? ((currentQuestionIndex + (quizFinished ? 1 : 0)) / questions.length) * 100 : 0;

useEffect(() => {
fetchQuestions();
fetchLeaderboard();
}, []);

useEffect(() => {
if (!quizStarted || quizFinished) return;

if (timeLeft === 0) {
handleAutoNext();
return;
}

const timer = setTimeout(() => {
setTimeLeft((prev) => prev - 1);
}, 1000);

return () => clearTimeout(timer);
}, [timeLeft, quizStarted, quizFinished, currentQuestionIndex]);

const fetchQuestions = async () => {
try {
const res = await fetch("http://localhost:5000/api/questions");
const data = await res.json();
const shuffled = [...data].sort(() => Math.random() - 0.5);
setQuestions(shuffled.slice(0, 10));
setLoading(false);
} catch (error) {
console.error("Error fetching questions:", error);
setLoading(false);
}
};

const fetchLeaderboard = async () => {
try {
const res = await fetch("http://localhost:5000/api/leaderboard");
const data = await res.json();
setLeaderboard(data);
} catch (error) {
console.error("Error fetching leaderboard:", error);
}
};

const startQuiz = () => {
if (!username.trim()) {
alert("Please enter your name");
return;
}
setQuizStarted(true);
setTimeLeft(15);
};

const saveQuizHistory = async (historyToSave) => {
try {
await fetch("http://localhost:5000/api/quiz-history", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ history: historyToSave })
});
} catch (error) {
console.error("Error saving quiz history:", error);
}
};

const goToNextQuestion = async (finalScoreOverride = null, updatedHistory = answerHistory) => {
const isLastQuestion = currentQuestionIndex === questions.length - 1;

if (isLastQuestion) {
const finalScore = finalScoreOverride !== null ? finalScoreOverride : score;
setQuizFinished(true);

try {
await fetch("http://localhost:5000/api/scores", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
username: username,
score: finalScore
})
});

await saveQuizHistory(updatedHistory);
fetchLeaderboard();
} catch (error) {
console.error("Error saving score:", error);
}
} else {
setTimeout(() => {
setCurrentQuestionIndex((prev) => prev + 1);
setSelectedAnswer("");
setFeedback("");
setTimeLeft(15);
}, 900);
}
};

const handleNextQuestion = () => {
if (!selectedAnswer) {
alert("Please select an answer");
return;
}

let updatedScore = score;
const isCorrect = selectedAnswer === currentQuestion.correct_answer;
const timeTaken = 15 - timeLeft;

if (isCorrect) {
updatedScore = score + 1;
setScore(updatedScore);
setFeedback("✅ Correct!");
} else {
setFeedback("❌ Wrong! Correct answer: " + currentQuestion.correct_answer);
}

const newHistoryItem = {
username: username,
question: currentQuestion.question,
selected_answer: selectedAnswer,
correct_answer: currentQuestion.correct_answer,
is_correct: isCorrect,
time_taken: timeTaken
};

const updatedHistory = [...answerHistory, newHistoryItem];
setAnswerHistory(updatedHistory);

goToNextQuestion(updatedScore, updatedHistory);
};

const handleAutoNext = () => {
const timeTaken = 15;
setFeedback("⏰ Time's up! Correct answer: " + currentQuestion.correct_answer);

const newHistoryItem = {
username: username,
question: currentQuestion.question,
selected_answer: "No answer",
correct_answer: currentQuestion.correct_answer,
is_correct: false,
time_taken: timeTaken
};

const updatedHistory = [...answerHistory, newHistoryItem];
setAnswerHistory(updatedHistory);

goToNextQuestion(score, updatedHistory);
};

const restartQuiz = () => {
setCurrentQuestionIndex(0);
setSelectedAnswer("");
setScore(0);
setQuizFinished(false);
setQuizStarted(false);
setFeedback("");
setTimeLeft(15);
setAnswerHistory([]);
fetchQuestions();
};

const clearLeaderboard = async () => {
const confirmClear = window.confirm("Are you sure you want to clear the leaderboard?");
if (!confirmClear) return;

try {
await fetch("http://localhost:5000/api/leaderboard", {
method: "DELETE"
});
fetchLeaderboard();
} catch (error) {
console.error("Error clearing leaderboard:", error);
}
};

if (loading) {
return (
<div className="app">
<div className="container">
<h1>Loading quiz...</h1>
</div>
</div>
);
}

return (
<div className="app">
<div className="container">
<h1>🧠 Interactive Quiz App</h1>
<p className="subtitle">Test your knowledge and climb the leaderboard!</p>

{!quizStarted && !quizFinished && (
<div className="start-screen">
<input
type="text"
placeholder="Enter your name"
value={username}
onChange={(e) => setUsername(e.target.value)}
/>
<button onClick={startQuiz}>Start Quiz</button>
</div>
)}

{quizStarted && !quizFinished && currentQuestion && (
<div>
<div className="progress-bar">
<div className="progress-fill" style={{ width: `${progress}%` }}></div>
</div>

<div className="timer">⏳ Time left: {timeLeft}s</div>

<div className="quiz-card">
<h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
<p className="question">{currentQuestion.question}</p>

<div className="options">
{[currentQuestion.option_a, currentQuestion.option_b, currentQuestion.option_c, currentQuestion.option_d].map((option, index) => (
<button
key={index}
className={selectedAnswer === option ? "option selected" : "option"}
onClick={() => setSelectedAnswer(option)}
>
{option}
</button>
))}
</div>

{feedback && <p className="feedback">{feedback}</p>}

<button className="next-btn" onClick={handleNextQuestion}>
{currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
</button>
</div>
</div>
)}

{quizFinished && (
<div className="result-card">
<h2>🎉 Quiz Complete!</h2>
<p>{username}, your score is:</p>
<h3>{score} / {questions.length}</h3>
<button onClick={restartQuiz}>Play Again</button>

<div className="history-section">
<h2>📋 Review Your Answers</h2>
{answerHistory.map((item, index) => (
<div key={index} className="history-card">
<p><strong>Q{index + 1}:</strong> {item.question}</p>
<p><strong>Your answer:</strong> {item.selected_answer}</p>
<p><strong>Correct answer:</strong> {item.correct_answer}</p>
<p><strong>Time taken:</strong> {item.time_taken} sec</p>
<p><strong>Result:</strong> {item.is_correct ? "✅ Correct" : "❌ Wrong"}</p>
</div>
))}
</div>
</div>
)}

<div className="leaderboard">
<div className="leaderboard-header">
<h2>🏆 Leaderboard</h2>
<button className="clear-btn" onClick={clearLeaderboard}>Clear Leaderboard</button>
</div>

{leaderboard.length === 0 ? (
<p>No scores yet.</p>
) : (
<ol>
{leaderboard.map((entry, index) => (
<li key={index}>
<strong>{entry.username}</strong> — {entry.score}
</li>
))}
</ol>
)}
</div>
</div>
</div>
);
}

export default App;