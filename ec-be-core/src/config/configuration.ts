export default () => ({
  auth: {
    jwtKey: process.env.JWT_KEY,
  },
  db: {
    dbConnection: process.env.DB_CONNECTION,
  },
  paymentSvcHost: process.env.PAYMENT_SVC_HOST,
});
