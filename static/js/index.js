class SoundButton extends HTMLElement {

	get sound() {
		return this.getAttribute('sound');
	}
	set sound(val) {
		if (val)
			this.setAttribute('sound', val);
		else
			this.removeAttribute('sound');
	}

	get label() {
		return this.getAttribute('label');
	}
	set label(val) {
		if (val)
			this.setAttribute('label', val);
		else
			this.removeAttribute('label');
	}

	constructor() {
		super();

		this.addEventListener('click', async e => {
			this.animateRipple(e);
			await fetch(`http://${window.location.host}/sounds/${this.sound}`);
		});

		const label = document.createElement('p');
		label.id = 'label';
		label.innerText = this.label;
		label.classList.add('text-center');

		let shadowRoot = this.attachShadow({mode: 'open'});
		shadowRoot.innerHTML = `
		<link href='https://unpkg.com/css.gg/icons/all.css' rel='stylesheet'>
		<link rel="stylesheet" href="/css/styles.css">
		`;
		shadowRoot.appendChild(label);
	}

	static get observedAttributes() {
		return ['sound', 'label'];
	}

	attributeChangedCallback(name, _oldValue, newValue) {
		if (name === 'label')
			this.shadowRoot.getElementById('label').innerText = newValue;
	}

	animateRipple = (e) => {
		const button = e.target;
		const diameter = Math.max(button.clientWidth, button.clientHeight);
		const radius = diameter/2;

		const circle = document.createElement('span');

		circle.style.width = circle.style.height = `${diameter}px`;
		circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
		circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
		circle.classList.add('ripple'); 

		const ripple = button.shadowRoot.querySelectorAll('.ripple')[0];
		if (ripple)
			ripple.remove();

		button.shadowRoot.appendChild(circle);
	}
}

class RefreshButton extends HTMLElement {

	constructor() {
		super();

		const icon = document.createElement('i');
		icon.classList.add('align-center', 'mr-2', 'gg-undo');

		const button = document.createElement('span');
		button.appendChild(icon);
		button.onclick = this.refreshSounds;

		let shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = `
		<link href='https://unpkg.com/css.gg/icons/all.css' rel='stylesheet'>
		<link rel="stylesheet" href="/css/styles.css">
		<style>
		i {
			cursor: pointer;
		}
		</style>
		`;
		shadowRoot.appendChild(button);
	}

	refreshSounds = async () => {
		await fetch(`http://${window.location.host}/refresh`);
		await buildSoundsButtons();
	}
}

async function buildSoundsButtons() {
	const existingButtons = Array.from(document.getElementsByTagName('sound-button'));
	existingButtons.map(b => b.remove());

	const sounds = await fetch(`http://${window.location.host}/sounds`).then(res => res.json());
	const soundsBoard = document.getElementById('sound-grid');
	sounds.map(s => {
		const b = new SoundButton();
		b.sound = s.name;
		b.label = s.name;
		soundsBoard.appendChild(b);
	});
}

window.customElements.define('sound-button', SoundButton);
window.customElements.define('refresh-button', RefreshButton);

window.onload = async () => await buildSoundsButtons();