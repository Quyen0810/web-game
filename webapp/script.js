// Helper function to switch between screens
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
  }
}

// Initialize event listeners after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Navigation for home cards
  document.getElementById('play-card').addEventListener('click', () => {
    resetGame();
    showScreen('game-screen');
  });
  document.getElementById('chat-card').addEventListener('click', () => {
    showScreen('chat-screen');
  });
  document.getElementById('quiz-card').addEventListener('click', () => {
    startQuiz();
    showScreen('quiz-screen');
  });

  // Auth buttons
  document.getElementById('login-btn').addEventListener('click', () => {
    showScreen('login-screen');
  });
  document.getElementById('register-btn').addEventListener('click', () => {
    showScreen('register-screen');
  });

  // Back buttons: go back to welcome screen
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen('welcome-screen');
    });
  });

  // Login form submit handler (dummy)
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    alert('Đăng nhập thành công!');
    showScreen('welcome-screen');
  });
  // Register form submit handler (dummy)
  document.getElementById('register-form').addEventListener('submit', e => {
    e.preventDefault();
    const pwd = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    if (pwd !== confirm) {
      alert('Mật khẩu không khớp!');
      return;
    }
    alert('Tạo tài khoản thành công!');
    showScreen('welcome-screen');
  });

  // Chat send handler
  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  // Game continue button
  document.getElementById('continue-btn').addEventListener('click', () => {
    document.getElementById('game-message').classList.add('hidden');
    resetGame();
  });

  initDragGame();
});

// Reset game position and hide message
function resetGame() {
  const character = document.getElementById('character');
  // Reset character position
  character.style.left = '80px';
  character.style.top = '120px';
  document.getElementById('game-message').classList.add('hidden');
}

// Initialize drag events for the character
function initDragGame() {
  const character = document.getElementById('character');
  const playground = document.getElementById('playground');
  const crosswalk = document.getElementById('crosswalk');
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  character.addEventListener('pointerdown', e => {
    dragging = true;
    const rect = character.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    character.classList.add('dragging');
    character.setPointerCapture(e.pointerId);
  });

  character.addEventListener('pointermove', e => {
    if (!dragging) return;
    const containerRect = playground.getBoundingClientRect();
    let x = e.clientX - containerRect.left - offsetX;
    let y = e.clientY - containerRect.top - offsetY;
    // Boundaries
    x = Math.max(0, Math.min(x, containerRect.width - character.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - character.offsetHeight));
    character.style.left = x + 'px';
    character.style.top = y + 'px';
  });

  character.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    character.classList.remove('dragging');
    character.releasePointerCapture(e.pointerId);
    // Check if character center is inside crosswalk
    const charRect = character.getBoundingClientRect();
    const charCenterX = charRect.left + charRect.width / 2;
    const charCenterY = charRect.top + charRect.height / 2;
    const crossRect = crosswalk.getBoundingClientRect();
    const msgBox = document.getElementById('game-message');
    const msgText = document.getElementById('game-msg-text');
    if (charCenterY > crossRect.top && charCenterY < crossRect.bottom) {
      msgText.innerText = 'Bạn đã đi đúng nơi quy định! Tuyệt vời!';
    } else {
      msgText.innerText = 'Bạn đã phạm luật! Bạn phải đóng phạt 150.000 VND do không đi đúng phần đường quy định.';
    }
    msgBox.classList.remove('hidden');
  });
}

// Quiz functionality
let questions = [
  {
    question: 'Theo Luật Giao thông đường bộ, người đi bộ phải đi ở đâu?',
    options: ['Bất kỳ chỗ nào trên đường', 'Làn đường dành cho xe cơ giới', 'Phần đường dành cho người đi bộ', 'Ở giữa đường'],
    correct: 2
  },
  {
    question: 'Theo Luật An ninh mạng 2018 thì không gian mạng quốc gia do ai quản lý?',
    options: ['Chính phủ', 'Quốc hội', 'Bộ Công an', 'Bộ Thông tin và Truyền thông'],
    correct: 0
  },
  {
    question: 'Theo pháp luật Việt Nam, từ mấy tuổi trở lên phải đội mũ bảo hiểm khi đi xe máy?',
    options: ['6 tuổi', '7 tuổi', '4 tuổi', '9 tuổi'],
    correct: 0
  },
  {
    question: 'Hành vi bạo lực học đường có thể bị xử lý như thế nào?',
    options: ['Vi phạm hành chính hoặc hình sự', 'Không bị xử lý', 'Chỉ bị nhắc nhở', 'Chỉ xử lý nội bộ'],
    correct: 0
  },
  {
    question: 'Người điều khiển xe đạp điện phải đạt độ tuổi tối thiểu nào?',
    options: ['14 tuổi', '16 tuổi', '18 tuổi', '12 tuổi'],
    correct: 1
  },
  {
    question: 'Sử dụng chất ma túy sẽ bị xử lý như thế nào?',
    options: ['Xử phạt hành chính và có thể bị xử lý hình sự', 'Không bị xử lý', 'Được khen thưởng', 'Chỉ cảnh cáo'],
    correct: 0
  },
  {
    question: 'Khi đèn giao thông đỏ, người đi bộ nên làm gì?',
    options: ['Đi qua ngay lập tức', 'Dừng lại chờ đèn xanh', 'Chạy thật nhanh', 'Vẫy taxi'],
    correct: 1
  },
  {
    question: 'Hút thuốc nơi công cộng bị xử phạt ra sao?',
    options: ['Không bị xử phạt', 'Xử phạt hành chính', 'Được hoan nghênh', 'Xử lý hình sự'],
    correct: 1
  },
  {
    question: 'Người dưới 18 tuổi có được phép uống rượu bia không?',
    options: ['Có', 'Không', 'Chỉ khi có phụ huynh', 'Tùy ý'],
    correct: 1
  },
  {
    question: 'Cảnh sát giao thông có quyền gì khi xử lý vi phạm giao thông?',
    options: ['Lập biên bản và xử phạt theo quy định', 'Bắt giam ngay lập tức', 'Giữ giấy tờ tùy thân vô thời hạn', 'Tịch thu mọi phương tiện'],
    correct: 0
  }
];

let currentIndex = 0;
let correctCount = 0;
let startTime;

function startQuiz() {
  currentIndex = 0;
  correctCount = 0;
  startTime = new Date();
  document.getElementById('next-question-btn').style.display = 'none';
  showQuestion();
}

function showQuestion() {
  const q = questions[currentIndex];
  document.getElementById('quiz-question').innerText = q.question;
  const optionsEl = document.getElementById('quiz-options');
  optionsEl.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerText = opt;
    btn.dataset.index = idx;
    btn.addEventListener('click', selectOption);
    optionsEl.appendChild(btn);
  });
  document.getElementById('next-question-btn').style.display = 'none';
}

function selectOption(e) {
  const selectedBtn = e.target;
  const selectedIndex = parseInt(selectedBtn.dataset.index);
  const q = questions[currentIndex];
  // Mark all options as selected to disable them
  document.querySelectorAll('#quiz-options .quiz-option').forEach(btn => {
    btn.classList.add('selected');
    btn.disabled = true;
  });
  if (selectedIndex === q.correct) {
    selectedBtn.classList.add('correct');
    correctCount++;
  } else {
    selectedBtn.classList.add('incorrect');
    // highlight correct one
    const correctBtn = document.querySelector(`#quiz-options .quiz-option[data-index='${q.correct}']`);
    if (correctBtn) correctBtn.classList.add('correct');
  }
  document.getElementById('next-question-btn').style.display = 'block';
}

document.getElementById('next-question-btn').addEventListener('click', () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  const timeTaken = Math.round((new Date() - startTime) / 1000);
  document.getElementById('quiz-result').innerText = `Bạn đã trả lời đúng ${correctCount}/${questions.length} câu! Thời gian: ${timeTaken} giây`;
  showScreen('result-screen');
}

// Ranking button handler
document.addEventListener('DOMContentLoaded', () => {
  const viewRankingBtn = document.getElementById('view-ranking-btn');
  if (viewRankingBtn) {
    viewRankingBtn.addEventListener('click', () => {
      showScreen('ranking-screen');
    });
  }
});

// Chat assistant implementation
function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  addMessage(msg, 'user');
  input.value = '';
  // Simulate AI reply
  setTimeout(() => {
    const reply = generateReply(msg);
    addMessage(reply, 'ai');
  }, 600);
}

function addMessage(text, role) {
  const box = document.getElementById('chat-box');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}`;
  msgDiv.innerText = text;
  box.appendChild(msgDiv);
  // scroll to bottom
  box.scrollTop = box.scrollHeight;
}

function generateReply(message) {
  const content = message.toLowerCase();
  if (content.includes('ma túy') || content.includes('ma tuy')) {
    return 'Sử dụng, tàng trữ, mua bán ma túy là hành vi vi phạm pháp luật nghiêm trọng và có thể bị xử lý hình sự. Bạn nên tránh xa ma túy để bảo vệ sức khỏe và tương lai của mình.';
  }
  if (content.includes('bạo lực') || content.includes('bao luc') || content.includes('đánh nhau')) {
    return 'Hành vi bạo lực học đường vi phạm đạo đức và pháp luật. Người vi phạm có thể bị xử phạt hành chính, bồi thường thiệt hại hoặc xử lý hình sự tùy theo mức độ.';
  }
  if (content.includes('đi bộ') || content.includes('qua đường') || content.includes('qua duong')) {
    return 'Khi qua đường, bạn phải đi đúng phần đường dành cho người đi bộ và tuân thủ tín hiệu đèn giao thông để đảm bảo an toàn.';
  }
  if (content.includes('luật an ninh mạng') || content.includes('an ninh mạng')) {
    return 'Theo Luật An ninh mạng 2018, không gian mạng quốc gia do Chính phủ quản lý. Luật quy định các biện pháp đảm bảo an ninh mạng nhằm bảo vệ quyền lợi của cá nhân và tổ chức.';
  }
  return 'Cảm ơn bạn đã đặt câu hỏi! Mình là trợ lý ảo nên chỉ cung cấp được thông tin tham khảo. Bạn có thể hỏi về các quy định pháp luật đời sống như giao thông, ma túy, bạo lực học đường…';
}