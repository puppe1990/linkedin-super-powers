import './popup.css';

const openLinkedInButton = document.getElementById('open-linkedin');

openLinkedInButton?.addEventListener('click', () => {
  void chrome.tabs.create({ url: 'https://www.linkedin.com/feed/' });
});
