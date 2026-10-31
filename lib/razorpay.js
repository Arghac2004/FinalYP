import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TlIO8sUg8ow0E4',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'cJS6tcs0cK8ZRtce0fuKh7dE',
});

export default razorpay;
