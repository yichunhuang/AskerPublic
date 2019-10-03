const stripe = Stripe('pk_test_lEcFwfwHFIt1cHqC8VILuZuJ00GgfzXGhQ');
const elements = stripe.elements();

const style = {
    base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4',
        }
    },
        invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};
// Add an instance of the card Element into the `card-element` <div>.
// card.mount('#card-element');
const cardNumber = elements.create('cardNumber', {style});
cardNumber.mount('#card-number');
const cardExpiry = elements.create('cardExpiry', {style});
cardExpiry.mount('#card-expiry');
const cardCvc = elements.create('cardCvc', {style});
cardCvc.mount('#card-cvc');

cardNumber.addEventListener('change', ({error}) => {
    
    if (error) {
        // displayError.textContent = error.message;
        let displayError = document.getElementById('errorMsg');
        displayError.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent=error.message;
        buyButton.innerHTML = 'Confirm';
    } else {
        // displayError.textContent = '';
    }
});

const stripeTokenHandler = (token) => {
    let accessToken = localStorage.getItem('accessToken');
    let email = document.getElementById('email').value; 
    let point = document.getElementById('point').value;
    let buyButton = document.getElementById('btn-comprar');

    if (!point) {
        buyButton.innerHTML = 'Confirm';
        let err = document.getElementById('errorMsg');
        err.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent='Points should be more than 0.';
        return;
    }
    if (!email) {
        buyButton.innerHTML = 'Confirm';
        let err = document.getElementById('errorMsg');
        err.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent='Email is required, order details will be sent to it.';
        return;
    }
    
    (async () => {
        let result =  await graph.mutate(`
            addStudentOrder(tokenId: "${token.id}", total: ${point}, recipientEmail: "${email}", accessToken: "${accessToken}") {
               id
               total 
               status
               recipientEmail
            }`
        )();  
        return result;
    })().then((result) => {
        if (result.addStudentOrder.status === "unpaid") {
            alert("Payment fail, please try again.")
            return;
        }
        let err = document.getElementById('errorMsg');
        err.style.visibility = 'hidden';
        let total = document.getElementById('lastTotal');
        total.textContent = result.addStudentOrder.total
        alert("Got " + result.addStudentOrder.total + " Points ! Check Payment Details in Email !");
        // success return
        let time = document.getElementById('nome-front');
        let date = new Date();
        time.value = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
        FancyCheckout.init();
        return;
    }).catch((err) => {
        alert(err[0].message);
        if (err[0].message === 'Token Invalid')
            window.location.replace("/signIn.html");
        buyButton.innerHTML = 'Confirm';
        return;
    })
}