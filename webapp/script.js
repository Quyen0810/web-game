function setStatus(element, type, message) {
  if (!element) return;
  if (typeof message === 'string') {
    element.innerHTML = message;
  }
  if (type) {
    element.dataset.state = type;
  } else {
    delete element.dataset.state;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

document.addEventListener('DOMContentLoaded', () => {
  const cyberReset = document.querySelector('[data-reset="cyber"]');
  const foodReset = document.querySelector('[data-reset="food"]');
  const civicReset = document.querySelector('[data-reset="civic"]');

  const cyberGame = initCyberGame();
  const foodGame = initFoodGame();
  const civicGame = initCivicGame();

  if (cyberReset) {
    cyberReset.addEventListener('click', () => cyberGame.reset());
  }
  if (foodReset) {
    foodReset.addEventListener('click', () => foodGame.reset());
  }
  if (civicReset) {
    civicReset.addEventListener('click', () => civicGame.resetActive());
  }
});

function initCyberGame() {
  const board = document.querySelector('.cyber-board');
  const character = document.getElementById('cyber-character');
  const safeZone = board?.querySelector('.safe-zone');
  const area = board?.querySelector('.cyber-play-area');
  const link = document.getElementById('phish-link');
  const virus = document.getElementById('virus-alert');
  const status = document.getElementById('cyber-status');

  if (!board || !character || !safeZone || !area || !link) {
    return { reset: () => {} };
  }

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let resolved = false;

  function applyPosition(left, top) {
    character.style.left = `${left}px`;
    character.style.top = `${top}px`;
  }

  function intersectsSafeZone() {
    const charRect = character.getBoundingClientRect();
    const safeRect = safeZone.getBoundingClientRect();
    const charCenterX = charRect.left + charRect.width / 2;
    const charCenterY = charRect.top + charRect.height / 2;
    return (
      charCenterX >= safeRect.left &&
      charCenterX <= safeRect.right &&
      charCenterY >= safeRect.top &&
      charCenterY <= safeRect.bottom
    );
  }

  function showSuccess() {
    if (resolved) return;
    resolved = true;
    board.classList.add('success');
    board.classList.remove('fail');
    virus?.classList.add('hidden');
    character.style.opacity = '1';
    setStatus(
      status,
      'success',
      'Tuyệt vời! Bạn đã kéo nhân vật ra khỏi liên kết lừa đảo kịp lúc.'
    );
  }

  function showFailure() {
    if (resolved) return;
    resolved = true;
    board.classList.add('fail');
    board.classList.remove('success');
    virus?.classList.remove('hidden');
    character.style.opacity = '0.2';
    setStatus(status, 'fail', 'Ôi không! Nhân vật đã bấm vào link độc hại và bị virus nuốt chửng.');
  }

  function onPointerDown(event) {
    if (resolved) return;
    dragging = true;
    const rect = character.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    character.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging || resolved) return;
    const areaRect = area.getBoundingClientRect();
    const newLeft = clamp(event.clientX - areaRect.left - offsetX, 0, areaRect.width - character.offsetWidth);
    const newTop = clamp(event.clientY - areaRect.top - offsetY, 0, areaRect.height - character.offsetHeight);
    applyPosition(newLeft, newTop);
    if (intersectsSafeZone()) {
      showSuccess();
    }
  }

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    character.releasePointerCapture?.(event.pointerId);
    if (!resolved && intersectsSafeZone()) {
      showSuccess();
    }
  }

  function reset() {
    resolved = false;
    dragging = false;
    board.classList.remove('success', 'fail');
    virus?.classList.add('hidden');
    character.style.opacity = '1';
    const areaRect = area.getBoundingClientRect();
    const left = areaRect.width - character.offsetWidth - 24;
    const top = areaRect.height / 2 - character.offsetHeight / 2;
    applyPosition(Math.max(left, 20), Math.max(top, 20));
    setStatus(
      status,
      '',
      'Giữ chuột/tay vào nhân vật và kéo vào <strong>khu an toàn</strong>. Đừng bấm vào liên kết!'
    );
  }

  character.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  link.addEventListener('click', event => {
    event.preventDefault();
    showFailure();
  });

  reset();

  return { reset };
}

function initFoodGame() {
  const board = document.querySelector('.food-board');
  const lid = document.getElementById('pot-lid');
  const potArea = board?.querySelector('.pot-area');
  const flies = document.getElementById('fly-squad');
  const status = document.getElementById('food-status');

  if (!board || !lid || !potArea || !flies) {
    return { reset: () => {} };
  }

  let dragging = false;
  let offsetX = 0;
  let currentLeft = 0;
  let resolved = false;
  let failTimer = null;

  function startTimer() {
    clearTimeout(failTimer);
    failTimer = setTimeout(() => {
      if (!resolved) {
        showFailure();
      }
    }, 6500);
  }

  function updateCoverage() {
    const maxLeft = potArea.clientWidth - lid.offsetWidth - 10;
    const minLeft = 20;
    const span = Math.max(maxLeft - minLeft, 1);
    const coverage = 1 - clamp((currentLeft - minLeft) / span, 0, 1);
    const percent = Math.round(coverage * 100);
    if (!resolved) {
      setStatus(status, '', `Độ che phủ: <strong>${percent}%</strong>. Kéo về hết bên trái để đậy kín.`);
    }
    return { coverage, percent };
  }

  function applyLeft(value) {
    currentLeft = value;
    lid.style.left = `${value}px`;
    return updateCoverage();
  }

  function showSuccess() {
    if (resolved) return;
    resolved = true;
    clearTimeout(failTimer);
    board.classList.add('success');
    board.classList.remove('fail');
    flies.classList.add('hidden');
    setStatus(status, 'success', 'Xuất sắc! Nồi đã được đậy kín, ruồi không thể xâm nhập.');
  }

  function showFailure() {
    if (resolved) return;
    resolved = true;
    board.classList.add('fail');
    flies.classList.remove('hidden');
    setStatus(status, 'fail', 'Chậm mất rồi! Đàn ruồi hóa boss và rượt đuổi cả quán.');
  }

  function onPointerDown(event) {
    if (resolved) return;
    dragging = true;
    const rect = lid.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    lid.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging || resolved) return;
    const areaRect = potArea.getBoundingClientRect();
    const maxLeft = potArea.clientWidth - lid.offsetWidth - 10;
    const minLeft = 20;
    const newLeft = clamp(event.clientX - areaRect.left - offsetX, minLeft, maxLeft);
    const { coverage } = applyLeft(newLeft);
    if (coverage >= 0.98) {
      showSuccess();
    }
  }

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    lid.releasePointerCapture?.(event.pointerId);
    const { coverage } = updateCoverage();
    if (!resolved && coverage >= 0.98) {
      showSuccess();
    }
  }

  function reset() {
    resolved = false;
    dragging = false;
    board.classList.remove('success', 'fail');
    flies.classList.add('hidden');
    const maxLeft = potArea.clientWidth - lid.offsetWidth - 10;
    applyLeft(maxLeft);
    setStatus(status, '', 'Kéo nắp sao cho chỉ số phủ kín đạt 100%.');
    startTimer();
  }

  lid.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  reset();

  return { reset };
}

function initCivicGame() {
  const tabs = document.querySelectorAll('.civic-tab');
  const scenes = document.querySelectorAll('.civic-scene');
  const status = document.getElementById('civic-status');

  const firecracker = setupFirecrackerScene(status);
  const flyers = setupFlyerScene(status);
  const karaoke = setupKaraokeScene(status);

  const controllers = {
    firecracker,
    flyers,
    karaoke
  };

  let activeScene = 'firecracker';

  function switchScene(sceneId) {
    if (sceneId === activeScene) {
      controllers[sceneId]?.reset();
      return;
    }

    controllers[activeScene]?.deactivate?.();

    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.scene === sceneId);
    });

    scenes.forEach(scene => {
      scene.classList.toggle('active', scene.id === `scene-${sceneId}`);
    });

    activeScene = sceneId;
    controllers[sceneId]?.reset();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchScene(tab.dataset.scene));
  });

  controllers[activeScene]?.reset();

  return {
    resetActive() {
      controllers[activeScene]?.reset();
    }
  };
}

function setupFirecrackerScene(status) {
  const stringEl = document.getElementById('firecracker-string');
  const smoke = document.getElementById('firecracker-smoke');
  const area = stringEl?.closest('.firecracker-area');

  if (!stringEl || !smoke || !area) {
    return { reset: () => {} };
  }

  let dragging = false;
  let startY = 0;
  let offset = 0;
  let resolved = false;
  let failTimer = null;

  function startTimer() {
    clearTimeout(failTimer);
    failTimer = setTimeout(() => {
      if (!resolved) {
        showFailure();
      }
    }, 5000);
  }

  function applyOffset(value) {
    offset = value;
    stringEl.style.transform = `translateY(${offset}px)`;
    if (!resolved) {
      const percent = Math.round((offset / 120) * 100);
      setStatus(status, '', `Tiến độ kéo dây: <strong>${clamp(percent, 0, 100)}%</strong>. Kéo hết cỡ để gỡ pháo.`);
    }
  }

  function showSuccess() {
    if (resolved) return;
    resolved = true;
    clearTimeout(failTimer);
    smoke.classList.remove('show');
    area.classList.add('success');
    setStatus(status, 'success', 'Bạn đã kịp thời rút dây pháo – không có tiếng nổ nào xảy ra.');
  }

  function showFailure() {
    if (resolved) return;
    resolved = true;
    clearTimeout(failTimer);
    smoke.classList.add('show');
    area.classList.add('fail');
    setStatus(status, 'fail', 'BOOM! Nhân vật hóa thành làn khói “Phạt 2 triệu”.');
  }

  function onPointerDown(event) {
    if (resolved) return;
    dragging = true;
    startY = event.clientY;
    stringEl.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging || resolved) return;
    const delta = event.clientY - startY;
    const newOffset = clamp(offset + delta, 0, 120);
    applyOffset(newOffset);
    startY = event.clientY;
    if (newOffset >= 120) {
      showSuccess();
    }
  }

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    stringEl.releasePointerCapture?.(event.pointerId);
    if (!resolved && offset >= 120) {
      showSuccess();
    }
  }

  function reset() {
    resolved = false;
    dragging = false;
    area.classList.remove('success', 'fail');
    smoke.classList.remove('show');
    offset = 0;
    applyOffset(0);
    setStatus(status, '', 'Kéo dây pháo ra khỏi tay nhân vật trước khi họ châm lửa.');
    startTimer();
  }

  stringEl.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  return {
    reset,
    deactivate() {
      clearTimeout(failTimer);
      resolved = true;
    }
  };
}

function setupFlyerScene(status) {
  const flyer = document.getElementById('flyer-stack');
  const trash = document.getElementById('trash-zone');
  const angryPole = document.getElementById('angry-pole');
  const area = flyer?.closest('.flyer-area');

  if (!flyer || !trash || !area || !angryPole) {
    return { reset: () => {} };
  }

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let resolved = false;
  let failTimer = null;

  function startTimer() {
    clearTimeout(failTimer);
    failTimer = setTimeout(() => {
      if (!resolved) {
        showFailure();
      }
    }, 6500);
  }

  function applyPosition(left, top) {
    flyer.style.left = `${left}px`;
    flyer.style.top = `${top}px`;
  }

  function showSuccess() {
    if (resolved) return;
    resolved = true;
    clearTimeout(failTimer);
    angryPole.classList.remove('show');
    flyer.style.opacity = '0';
    flyer.style.pointerEvents = 'none';
    setStatus(status, 'success', 'Hay quá! Tờ rơi đã vào thùng rác, cột điện không thể đuổi theo.');
  }

  function showFailure() {
    if (resolved) return;
    resolved = true;
    clearTimeout(failTimer);
    angryPole.classList.add('show');
    setStatus(status, 'fail', 'Cột điện sống dậy và quấn nhân vật bằng dây điện vì dán tờ rơi bừa bãi.');
  }

  function onPointerDown(event) {
    if (resolved) return;
    dragging = true;
    const rect = flyer.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    flyer.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging || resolved) return;
    const areaRect = area.getBoundingClientRect();
    const newLeft = clamp(event.clientX - areaRect.left - offsetX, 0, areaRect.width - flyer.offsetWidth);
    const newTop = clamp(event.clientY - areaRect.top - offsetY, 0, areaRect.height - flyer.offsetHeight);
    applyPosition(newLeft, newTop);
  }

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    flyer.releasePointerCapture?.(event.pointerId);
    const flyerRect = flyer.getBoundingClientRect();
    const trashRect = trash.getBoundingClientRect();
    const centerX = flyerRect.left + flyerRect.width / 2;
    const centerY = flyerRect.top + flyerRect.height / 2;
    if (
      centerX >= trashRect.left &&
      centerX <= trashRect.right &&
      centerY >= trashRect.top &&
      centerY <= trashRect.bottom
    ) {
      showSuccess();
    }
  }

  function reset() {
    resolved = false;
    dragging = false;
    angryPole.classList.remove('show');
    flyer.style.opacity = '1';
    flyer.style.pointerEvents = 'auto';
    const baseTop = area.clientHeight / 2 - flyer.offsetHeight / 2;
    applyPosition(80, clamp(baseTop, 20, area.clientHeight - flyer.offsetHeight - 20));
    setStatus(status, '', 'Kéo xấp tờ rơi vào thùng rác trước khi cột điện nổi giận.');
    startTimer();
  }

  flyer.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  return {
    reset,
    deactivate() {
      clearTimeout(failTimer);
      resolved = true;
    }
  };
}

function setupKaraokeScene(status) {
  const slider = document.getElementById('volume-slider');
  const neighbors = document.getElementById('neighbor-rage');

  if (!slider || !neighbors) {
    return { reset: () => {} };
  }

  let resolved = false;
  let failTimer = null;

  function startTimer() {
    clearTimeout(failTimer);
    failTimer = setTimeout(() => {
      if (!resolved) {
        showFailure();
      }
    }, 7000);
  }

  function updateStatusLine() {
    if (!resolved) {
      setStatus(status, '', `Âm lượng hiện tại: <strong>${slider.value}%</strong>. Hạ xuống dưới 20% trước khi hàng xóm đến.`);
    }
  }

  function showSuccess() {
    if (resolved) return;
    resolved = true;
    clearTimeout(failTimer);
    neighbors.classList.remove('show');
    setStatus(status, 'success', 'Bạn đã hạ âm lượng kịp lúc, khu dân cư vẫn yên bình.');
  }

  function showFailure() {
    if (resolved) return;
    resolved = true;
    clearTimeout(failTimer);
    neighbors.classList.add('show');
    setStatus(status, 'fail', 'Cả khu phố kéo đến ném gối và phạt 1 triệu vì ồn ào lúc 11 giờ đêm.');
  }

  slider.addEventListener('input', () => {
    if (resolved) return;
    updateStatusLine();
    if (Number(slider.value) <= 20) {
      showSuccess();
    }
  });

  function reset() {
    resolved = false;
    neighbors.classList.remove('show');
    slider.value = 85;
    updateStatusLine();
    startTimer();
  }

  return {
    reset,
    deactivate() {
      clearTimeout(failTimer);
      resolved = true;
    }
  };
}
