const contactForm = document.getElementById('contact');
const newsletterForm = document.getElementById('newsletter');

const formSubmitEventHandler = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const url = form.getAttribute('action');
    const method = form.getAttribute('method');
    const sendbutton = form.querySelector('button[type="submit"]');

    sendbutton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

    try {
        const resp_text = await sendFormDataToApi();
        form.reset();
        if (resp_text === 'Accepted') {
            sendbutton.innerHTML = 'Thanks! 🎉';
            sendbutton.classList.remove('btn-dark');
            sendbutton.classList.add('btn-success');
        }
        else {
            sendbutton.innerHTML = 'Error';
            sendbutton.classList.remove('btn-dark');
            sendbutton.classList.add('btn-danger');
        }
        console.log(resp_text);
    } catch (error) {
        console.error('Error sending data:', error);
        sendbutton.innerHTML = 'Error';
        sendbutton.classList.remove('btn-dark');
        sendbutton.classList.add('btn-danger');
    }
    async function sendFormDataToApi() {
        const response = await fetch(url, {
            method: method,
            body: formData,
        });
        const data = await response.text();
        return data;
    }
};

contactForm.addEventListener('submit', formSubmitEventHandler);
newsletterForm.addEventListener('submit', formSubmitEventHandler);