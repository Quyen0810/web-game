let activeNavTarget = 'welcome-screen';
let totalScore = 0;
let crosswalkCompleted = false;
let signMatchCorrect = 0;
let safetyKitCorrect = 0;
let draggedCard = null;
 
function clearDraggedCard() {
  if (draggedCard) {
    draggedCard.classList.remove('dragging');
  }
  draggedCard = null;
}

const levelMeta = {
  crosswalk: {
    name: 'Qua đường an toàn',
    feedback: 'Giữ và kéo nhân vật băng qua vạch kẻ đúng quy định để ghi điểm.'
  },
  'sign-match': {
    name: 'Nhớ biển báo',
    feedback: 'Kéo thả biểu tượng biển báo vào mô tả tương ứng. Mỗi lần chính xác sẽ nhận 10 điểm.'
  },
  'safety-kit': {
    name: 'Trang bị an toàn',
    feedback: 'Chọn đúng 3 vật dụng cần thiết trước khi khởi hành để cộng điểm.'
  }
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
  }
  setActiveNav(id);
}

function setActiveNav(targetId) {
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.target === targetId) {
      link.classList.add('active');
      activeNavTarget = targetId;
    } else {
      link.classList.remove('active');
    }
  });
}

function updateScore(points) {
  if (points <= 0) return;
  totalScore += points;
  const scoreEl = document.getElementById('game-score');
  if (scoreEl) {
    scoreEl.textContent = totalScore;
  }
}

function setFeedback(message) {
  const banner = document.getElementById('game-feedback');
  if (banner) {
    banner.textContent = message;
  }
}

function setLevelMeta(gameId) {
  const meta = levelMeta[gameId];
  const levelNameEl = document.getElementById('level-name');
  if (levelNameEl && meta) {
    levelNameEl.textContent = meta.name;
  }
  if (meta) {
    setFeedback(meta.feedback);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Navigation for top links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.target;
      if (!target) return;
      showScreen(target);
      if (target === 'game-screen') {
        activateGame('crosswalk');
      }
      if (target === 'quiz-screen') {
        startQuiz();
      }
    });
  });

  const heroPlay = document.getElementById('cta-play');
  if (heroPlay) {
    heroPlay.addEventListener('click', () => {
      showScreen('game-screen');
      activateGame('crosswalk');
    });
  }

  const heroQuiz = document.getElementById('cta-quiz');
  if (heroQuiz) {
    heroQuiz.addEventListener('click', () => {
      showScreen('quiz-screen');
      startQuiz();
    });
  }

  // Navigation for home cards
  document.getElementById('play-card').addEventListener('click', () => {
    showScreen('game-screen');
    activateGame('crosswalk');
  });
  document.getElementById('chat-card').addEventListener('click', () => {
    showScreen('chat-screen');
  });
  document.getElementById('quiz-card').addEventListener('click', () => {
    showScreen('quiz-screen');
    startQuiz();
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

  const viewRankingBtn = document.getElementById('view-ranking-btn');
  if (viewRankingBtn) {
    viewRankingBtn.addEventListener('click', () => {
      showScreen('ranking-screen');
    });
  }

  initGameTabs();
  initCrosswalkGame();
  setupSignMatchGame();
  setupSafetyKitGame();

  // Game continue button
  document.getElementById('continue-btn').addEventListener('click', () => {
    document.getElementById('game-message').classList.add('hidden');
    resetCrosswalkGame();
  });

  startQuiz();
});

function initGameTabs() {
  document.querySelectorAll('.game-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const gameId = tab.dataset.game;
      activateGame(gameId);
    });
  });
}

function activateGame(gameId) {
  if (!gameId) return;
  document.querySelectorAll('.game-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.game === gameId);
  });
  document.querySelectorAll('.game-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `${gameId}-game`);
  });
  setLevelMeta(gameId);
  if (gameId === 'crosswalk') {
    resetCrosswalkGame();
  }
}

function resetCrosswalkGame() {
  const character = document.getElementById('character');
  if (!character) return;
  character.style.left = '90px';
  character.style.top = '140px';
  crosswalkCompleted = false;
  document.getElementById('game-message').classList.add('hidden');
}

function initCrosswalkGame() {
  const character = document.getElementById('character');
  const playground = document.getElementById('playground');
  const crosswalk = document.getElementById('crosswalk');
  if (!character || !playground || !crosswalk) return;

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
    x = Math.max(0, Math.min(x, containerRect.width - character.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - character.offsetHeight));
    character.style.left = `${x}px`;
    character.style.top = `${y}px`;
  });

  character.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    character.classList.remove('dragging');
    character.releasePointerCapture(e.pointerId);
    evaluateCrosswalk();
  });
}

function evaluateCrosswalk() {
  if (crosswalkCompleted) return;
  const character = document.getElementById('character');
  const crosswalk = document.getElementById('crosswalk');
  const msgBox = document.getElementById('game-message');
  const msgText = document.getElementById('game-msg-text');
  if (!character || !crosswalk || !msgBox || !msgText) return;

  const charRect = character.getBoundingClientRect();
  const crossRect = crosswalk.getBoundingClientRect();
  const charCenterY = charRect.top + charRect.height / 2;

  if (charCenterY > crossRect.top && charCenterY < crossRect.bottom) {
    msgText.innerText = 'Tuyệt vời! Bạn đã băng qua đúng nơi quy định và nhận 10 điểm thưởng.';
    updateScore(10);
    setFeedback('Bạn đã vượt qua cấp độ qua đường an toàn! +10 điểm');
  } else {
    msgText.innerText = 'Ôi! Bạn đã đi sai vạch qua đường và bị nhắc nhở. Hãy thử lại nhé.';
    setFeedback('Hãy đưa nhân vật đứng đúng trên vạch qua đường để an toàn.');
  }
  crosswalkCompleted = true;
  msgBox.classList.remove('hidden');
}

function setupSignMatchGame() {
  initDragSources('#sign-bank .draggable-card');
  document.querySelectorAll('#sign-match-game .drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
    });
    zone.addEventListener('dragenter', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', () => {
      zone.classList.remove('drag-over');
      if (!draggedCard) return;
      if (zone.classList.contains('filled')) {
        setFeedback('Bạn đã hoàn thành mô tả này rồi. Hãy chọn ô khác nhé!');
        clearDraggedCard();
        return;
      }
      const expected = zone.dataset.target;
      const actual = draggedCard.dataset.sign;
      if (expected === actual) {
        zone.classList.remove('error');
        zone.classList.add('filled');
        const placeholder = zone.querySelector('.drop-placeholder');
        if (placeholder) {
          placeholder.textContent = 'Chính xác!';
        }
        const summary = document.createElement('div');
        summary.className = 'dropped-item';
        summary.textContent = draggedCard.textContent;
        zone.appendChild(summary);
        draggedCard.remove();
        signMatchCorrect++;
        updateScore(10);
        setFeedback('Bạn đã ghép đúng biển báo! +10 điểm');
        updateSignStatus();
      } else {
        zone.classList.add('error');
        setFeedback('Sai rồi! Hãy đọc kỹ mô tả biển báo trước khi thả.');
        setTimeout(() => zone.classList.remove('error'), 1200);
      }
      clearDraggedCard();
    });
  });
}

function updateSignStatus() {
  const status = document.getElementById('sign-status');
  if (status) {
    status.textContent = `Đã ghép đúng: ${signMatchCorrect}/3`;
  }
  if (signMatchCorrect === 3) {
    setFeedback('Bạn đã ghi nhớ 3 biển báo quan trọng! Tiếp tục nào.');
  }
}

function setupSafetyKitGame() {
  initDragSources('#safety-bank .draggable-card');
  const dropZone = document.querySelector('#safety-kit-game .drop-zone');
  if (!dropZone) return;
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
  });
  dropZone.addEventListener('dragenter', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', () => {
    dropZone.classList.remove('drag-over');
    if (!draggedCard) return;
    if (draggedCard.dataset.item && dropZone.querySelector(`[data-item='${draggedCard.dataset.item}']`)) {
      setFeedback('Vật dụng này đã nằm trong balo rồi!');
      clearDraggedCard();
      return;
    }
    const isCorrect = draggedCard.dataset.correct === 'true';
    if (!isCorrect) {
      dropZone.classList.add('error');
      setFeedback('Vật dụng này không an toàn khi tham gia giao thông. Hãy chọn thứ khác.');
      setTimeout(() => dropZone.classList.remove('error'), 1200);
      clearDraggedCard();
      return;
    }
    if (safetyKitCorrect >= 3) {
      setFeedback('Bạn đã chuẩn bị đủ đồ cần thiết rồi!');
      clearDraggedCard();
      return;
    }
    const placeholder = dropZone.querySelector('.drop-placeholder');
    if (placeholder) {
      placeholder.textContent = 'Tiếp tục chọn vật dụng an toàn!';
    }
    const summary = document.createElement('div');
    summary.className = 'dropped-item';
    summary.dataset.item = draggedCard.dataset.item;
    summary.textContent = draggedCard.textContent;
    dropZone.appendChild(summary);
    draggedCard.remove();
    safetyKitCorrect++;
    updateScore(10);
    updateSafetyStatus();
    setFeedback('Chuẩn bị đồ bảo hộ chính xác! +10 điểm');
    clearDraggedCard();
  });
}

function updateSafetyStatus() {
  const status = document.getElementById('safety-status');
  if (status) {
    status.textContent = `Đồ an toàn đã sẵn sàng: ${safetyKitCorrect}/3`;
  }
  if (safetyKitCorrect === 3) {
    setFeedback('Tuyệt! Bạn đã có đủ 3 vật dụng an toàn cho chuyến đi.');
  }
}

function initDragSources(selector) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('dragstart', e => {
      draggedCard = card;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => card.classList.add('dragging'), 0);
    });
    card.addEventListener('dragend', () => {
      clearDraggedCard();
    });
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
  const nextBtn = document.getElementById('next-question-btn');
  if (nextBtn) {
    nextBtn.style.display = 'none';
  }
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
  document.querySelectorAll('#quiz-options .quiz-option').forEach(btn => {
    btn.classList.add('selected');
    btn.disabled = true;
  });
  if (selectedIndex === q.correct) {
    selectedBtn.classList.add('correct');
    correctCount++;
  } else {
    selectedBtn.classList.add('incorrect');
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

function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  addMessage(msg, 'user');
  input.value = '';
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
  box.scrollTop = box.scrollHeight;
}

function generateReply(message) {
  const content = message.toLowerCase();
  if (content.includes('ma túy') || content.includes('ma tuy')) {
    return 'Sử dụng, tàng trữ, mua bán ma túy là hành vi vi phạm pháp luật nghiêm trọng và có thể bị xử lý hình sự. Hãy tránh xa ma túy để bảo vệ sức khỏe và tương lai của mình.';
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
