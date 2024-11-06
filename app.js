// app.js

const app = document.getElementById('app');

let studentName = '';
let selectedQuiz = null;
let quizzes = [];
let currentQuizData = null;
let studentResponses = [];

// Object to track score breakdown per category
let scoreBreakdown = {};

document.addEventListener('DOMContentLoaded', () => {
  displayClassSelection();
});

function displayClassSelection() {
  fetch('./students/teacher1classes.json')
    .then(response => response.json())
    .then(data => {
      const classes = data.classes;

      const title = document.createElement('h1');
      title.textContent = 'Select Your Class';

      const classList = document.createElement('ul');
      classList.className = 'class-list';

      classes.forEach((classItem) => {
        const listItem = document.createElement('li');

        const classButton = document.createElement('button');
        classButton.textContent = classItem.className;
        classButton.addEventListener('click', () => {
          displayStudentLogin(classItem);
        });

        listItem.appendChild(classButton);
        classList.appendChild(listItem);
      });

      app.innerHTML = '';
      app.appendChild(title);
      app.appendChild(classList);
    })
    .catch(error => {
      console.error('Error loading classes:', error);
      alert('Failed to load class data.');
    });
}

function displayStudentLogin(classData) {
  const title = document.createElement('h1');
  title.textContent = `Class: ${classData.className}`;

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Select your name:';

  const nameSelect = document.createElement('select');
  nameSelect.id = 'student-name-select';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select your name';
  nameSelect.appendChild(defaultOption);

  classData.students.forEach(student => {
    const option = document.createElement('option');
    option.value = `${student.firstName} ${student.lastName}`;
    option.textContent = `${student.firstName} ${student.lastName}`;
    nameSelect.appendChild(option);
  });

  const passwordLabel = document.createElement('label');
  passwordLabel.textContent = 'Enter your password:';

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'student-password';
  passwordInput.placeholder = 'Password';

  const loginButton = document.createElement('button');
  loginButton.textContent = 'Login';
  loginButton.addEventListener('click', () => {
    const selectedName = nameSelect.value;
    const enteredPassword = passwordInput.value.trim();

    if (selectedName && enteredPassword) {
      const selectedStudent = classData.students.find(student => `${student.firstName} ${student.lastName}` === selectedName);
      if (selectedStudent) {
        if (enteredPassword === selectedStudent.password) {
          studentName = selectedName;
          // Proceed to quiz selection
          loadQuizzes();
        } else {
          alert('Incorrect password. Please try again.');
        }
      } else {
        alert('Student not found.');
      }
    } else {
      alert('Please select your name and enter your password.');
    }
  });

  app.innerHTML = '';
  app.appendChild(title);
  app.appendChild(nameLabel);
  app.appendChild(nameSelect);
  app.appendChild(document.createElement('br'));
  app.appendChild(passwordLabel);
  app.appendChild(passwordInput);
  app.appendChild(document.createElement('br'));
  app.appendChild(document.createElement('br'));
  app.appendChild(loginButton);
}

function loadQuizzes() {
  fetch('./quizzes.json')
    .then(response => response.json())
    .then(data => {
      quizzes = data;
      displayQuizList();
    })
    .catch(error => {
      console.error('Error loading quizzes:', error);
      alert('Failed to load quiz list.');
    });
}

function displayQuizList() {
  const title = document.createElement('h1');
  title.textContent = 'Available Quizzes';

  const list = document.createElement('ul');
  list.className = 'quiz-list';

  quizzes.forEach((quiz, index) => {
    const listItem = document.createElement('li');

    const quizName = document.createElement('span');
    const quizTitle = quiz.textFile;
    quizName.textContent = `Quiz ${index + 1}: ${quizTitle}`;
    listItem.appendChild(quizName);

    const startButton = document.createElement('button');
    startButton.textContent = 'Start Quiz';
    startButton.addEventListener('click', () => {
      selectedQuiz = quiz;
      loadQuizData(quiz);
    });

    listItem.appendChild(startButton);
    list.appendChild(listItem);
  });

  app.innerHTML = '';
  app.appendChild(title);
  app.appendChild(list);
}

function loadQuizData(quiz) {
  const quizFile = `./worksheets/${quiz.worksheetFile}`;
  const textFile = `./texts/${quiz.textFile}`;

  fetchQuizData(quizFile).then(quizData => {
    currentQuizData = quizData;
    fetchTextData(textFile).then(textData => {
      displayQuizPage(textData);
    });
  }).catch(error => {
    console.error('Error loading quiz data:', error);
    alert('Failed to load quiz data. Please check the console for details.');
  });
}

function fetchQuizData(quizFile) {
  return fetch(quizFile)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    });
}

function fetchTextData(textFile) {
  return fetch(textFile)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    });
}

function displayQuizPage(textData) {
  const title = document.createElement('h1');
  title.textContent = currentQuizData.quizTitle;

  const textDisplay = document.createElement('div');
  textDisplay.className = 'text-display';
  textDisplay.textContent = textData;

  const form = document.createElement('form');
  form.id = 'quiz-form';

  currentQuizData.questions.forEach(question => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.id = `question-${question.id}`; // Assign unique ID for styling

    const questionTitle = document.createElement('h3');
    questionTitle.innerHTML = question.question;
    questionDiv.appendChild(questionTitle);

    if (question.type === 'multipleChoice') {
      const optionsList = document.createElement('ul');
      optionsList.className = 'options';
      question.options.forEach(option => {
        const optionItem = document.createElement('li');
        const optionLabel = document.createElement('label');
        const optionRadio = document.createElement('input');
        optionRadio.type = 'radio';
        optionRadio.name = `question-${question.id}`;
        optionRadio.value = option;
        optionLabel.appendChild(optionRadio);
        optionLabel.appendChild(document.createTextNode(option));
        optionItem.appendChild(optionLabel);
        optionsList.appendChild(optionItem);
      });
      questionDiv.appendChild(optionsList);
    } else if (question.type === 'trueFalse') {
      const optionsList = document.createElement('ul');
      optionsList.className = 'options';

      ['True', 'False'].forEach(option => {
        const optionItem = document.createElement('li');
        const optionLabel = document.createElement('label');
        const optionRadio = document.createElement('input');
        optionRadio.type = 'radio';
        optionRadio.name = `question-${question.id}`;
        optionRadio.value = option;
        optionLabel.appendChild(optionRadio);
        optionLabel.appendChild(document.createTextNode(option));
        optionItem.appendChild(optionLabel);
        optionsList.appendChild(optionItem);
      });

      questionDiv.appendChild(optionsList);
    } else if (question.type === 'fillInTheBlank') {
      const questionParts = question.question.split('_____');
      const blankCount = questionParts.length - 1;

      // Clear the question div and rebuild with inputs
      questionDiv.innerHTML = '';

      questionParts.forEach((part, index) => {
        const partSpan = document.createElement('span');
        partSpan.textContent = part;
        questionDiv.appendChild(partSpan);

        if (index < blankCount) {
          const blankInput = document.createElement('input');
          blankInput.type = 'text';
          blankInput.name = `question-${question.id}-blank-${index + 1}`;
          blankInput.className = 'blank-input';
          blankInput.placeholder = `Blank ${index + 1}`;
          questionDiv.appendChild(blankInput);
        }
      });
    } else if (question.type === 'shortAnswer') {
      const textarea = document.createElement('textarea');
      textarea.name = `question-${question.id}`;
      textarea.rows = 4;
      textarea.placeholder = 'Your Answer Here...';
      questionDiv.appendChild(textarea);
    }

    form.appendChild(questionDiv);
  });

  const submitButtonDiv = document.createElement('div');
  submitButtonDiv.className = 'button-container';
  const submitButton = document.createElement('button');
  submitButton.type = 'button';
  submitButton.textContent = 'Submit Quiz';
  submitButton.addEventListener('click', processQuizResults);
  submitButtonDiv.appendChild(submitButton);

  form.appendChild(submitButtonDiv);

  app.innerHTML = '';
  app.appendChild(title);
  app.appendChild(textDisplay);
  app.appendChild(form);
}

function processQuizResults() {
  const form = document.getElementById('quiz-form');
  const formData = new FormData(form);
  studentResponses = [];
  let totalScore = 0;

  // Initialize scoreBreakdown
  scoreBreakdown = {};

  currentQuizData.questions.forEach(question => {
    const qType = question.type;

    // Initialize scoreBreakdown for the category if not already
    if (!scoreBreakdown[qType]) {
      scoreBreakdown[qType] = { correct: 0, total: 0 };
    }

    if (['multipleChoice', 'trueFalse'].includes(qType)) {
      scoreBreakdown[qType].total += 1;
      const response = formData.get(`question-${question.id}`) || '';
      let correctAnswer = '';

      if (qType === 'trueFalse') {
        correctAnswer = question.answer ? 'True' : 'False';
      } else {
        correctAnswer = question.answer;
      }

      const isCorrect = response.trim().toLowerCase() === correctAnswer.toLowerCase();

      if (isCorrect) {
        totalScore += 1;
        scoreBreakdown[qType].correct += 1;
      }

      studentResponses.push({
        id: question.id,
        question: question.question,
        response: response,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        type: qType
      });

    } else if (qType === 'fillInTheBlank') {
      const questionParts = question.question.split('_____');
      const blankCount = questionParts.length - 1;

      scoreBreakdown[qType].total += blankCount;

      for (let i = 0; i < blankCount; i++) {
        const response = formData.get(`question-${question.id}-blank-${i + 1}`) || '';
        const correctAnswers = question.answers[i];
        const correctAnsArray = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];

        const isCorrect = correctAnsArray.some(ans => response.trim().toLowerCase() === ans.toLowerCase());

        if (isCorrect) {
          totalScore += 1;
          scoreBreakdown[qType].correct += 1;
        }

        studentResponses.push({
          id: `${question.id}-blank-${i + 1}`,
          question: question.question,
          response: response,
          correctAnswer: correctAnsArray.join(', '),
          isCorrect: isCorrect,
          type: qType
        });
      }
    } else if (qType === 'shortAnswer') {
      scoreBreakdown[qType].total += 1;
      const response = formData.get(`question-${question.id}`) || '';
      // For shortAnswer, automatic grading is not implemented. Mark as N/A
      studentResponses.push({
        id: question.id,
        question: question.question,
        response: response,
        correctAnswer: 'N/A',
        isCorrect: null,
        type: qType
      });
    }
  });

  displayResults(totalScore, getTotalPossible());
}

function getTotalPossible() {
  let total = 0;
  for (let category in scoreBreakdown) {
    total += scoreBreakdown[category].total;
  }
  return total;
}

function displayResults(totalScore, possibleScore) {
  const title = document.createElement('h1');
  title.textContent = 'Quiz Results';

  const scorePara = document.createElement('p');
  scorePara.textContent = `${studentName}, you scored ${totalScore} out of ${possibleScore}.`;

  // Create score breakdown by category
  const breakdownDiv = document.createElement('div');
  breakdownDiv.className = 'score-breakdown';

  const breakdownTitle = document.createElement('h2');
  breakdownTitle.textContent = 'Score Breakdown by Section';
  breakdownDiv.appendChild(breakdownTitle);

  const breakdownList = document.createElement('ul');
  for (let category in scoreBreakdown) {
    const listItem = document.createElement('li');
    listItem.textContent = `${capitalizeFirstLetter(category)}: ${scoreBreakdown[category].correct} / ${scoreBreakdown[category].total}`;
    breakdownList.appendChild(listItem);
  }
  breakdownDiv.appendChild(breakdownList);

  const resultsDiv = document.createElement('div');

  studentResponses.forEach(response => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result';

    // Add 'correct' or 'incorrect' class based on the response
    if (response.isCorrect === true) {
      resultItem.classList.add('correct');
    } else if (response.isCorrect === false) {
      resultItem.classList.add('incorrect');
    }

    const questionText = document.createElement('p');
    questionText.innerHTML = `<strong>Question ${response.id}:</strong> ${response.question}`;
    resultItem.appendChild(questionText);

    const responseText = document.createElement('p');
    responseText.innerHTML = `<strong>Your Answer:</strong> ${response.response}`;
    resultItem.appendChild(responseText);

    if (response.isCorrect !== null) {
      const correctness = document.createElement('p');
      correctness.innerHTML = `<strong>Result:</strong> ${response.isCorrect ? 'Correct' : 'Incorrect'}`;
      resultItem.appendChild(correctness);
    }

    resultsDiv.appendChild(resultItem);
  });

  const downloadButtonDiv = document.createElement('div');
  downloadButtonDiv.className = 'button-container';
  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download Results';
  downloadButton.addEventListener('click', downloadCSV);
  downloadButtonDiv.appendChild(downloadButton);

  app.innerHTML = '';
  app.appendChild(title);
  app.appendChild(scorePara);
  app.appendChild(breakdownDiv);
  app.appendChild(resultsDiv);
  app.appendChild(downloadButtonDiv);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function downloadCSV() {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += `Student Name,${studentName}\n`;
  
  // Add score breakdown at the top
  csvContent += `\nScore Breakdown by Section\n`;
  csvContent += `Section,Correct,Total\n`;
  for (let category in scoreBreakdown) {
    csvContent += `${capitalizeFirstLetter(category)},${scoreBreakdown[category].correct},${scoreBreakdown[category].total}\n`;
  }

  // Add an empty line before question details
  csvContent += `\nQuestion Details\n`;
  csvContent += `Question ID,Question,Your Answer,Correct Answer,Result,Section\n`;

  studentResponses.forEach(response => {
    let answerField = response.response;
    let correctAnswerField = response.correctAnswer;
    let resultField = response.isCorrect === null ? 'N/A' : (response.isCorrect ? 'Correct' : 'Incorrect');
    let sectionField = capitalizeFirstLetter(response.type);

    // Escape double quotes by replacing " with ""
    answerField = `"${answerField.replace(/"/g, '""')}"`;
    correctAnswerField = `"${correctAnswerField.replace(/"/g, '""')}"`;

    csvContent += `${response.id},"${response.question}",${answerField},${correctAnswerField},${resultField},${sectionField}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${studentName}_quiz_results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
