const UI = {
    createButton(text, className, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.addEventListener('click', onClick);
        return button;
    },

    createElement(tag, className, parent) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (parent) parent.appendChild(element);
        return element;
    },

    createText(text, className, parent) {
        const element = document.createElement('p');
        element.textContent = text;
        if (className) element.className = className;
        if (parent) parent.appendChild(element);
        return element;
    },

    showMessage(message, duration = 2000) {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            z-index: 100;
            animation: fadeIn 0.3s ease;
        `;
        msg.textContent = message;
        document.body.appendChild(msg);

        setTimeout(() => {
            msg.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => document.body.removeChild(msg), 300);
        }, duration);
    }
};
