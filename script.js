const hamburger = document.getElementById('hamburger');
const navPanel = document.getElementById('nav-panel');
const overlay = document.getElementById('overlay');

hamburger.onclick = function() {
  if (navPanel.style.left === '0px') {
      closeNavPanel();
  } else {
      openNavPanel();
  }
};

overlay.onclick = function() {
  closeNavPanel();
};

function openNavPanel() {
  navPanel.style.display = 'block';
  setTimeout(() => {
      navPanel.style.left = '0px';
      overlay.style.display = 'block';
  }, 10);
}

function closeNavPanel() {
  navPanel.style.left = '-250px';
  overlay.style.display = 'none';
  setTimeout(() => {
      navPanel.style.display = 'none';
  }, 300);
}