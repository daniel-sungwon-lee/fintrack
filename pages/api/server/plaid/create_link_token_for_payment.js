export default function handler (request, response, next) {
  Promise.resolve()
    .then(async function () {
      const createRecipientResponse =
        await client.paymentInitiationRecipientCreate({
          name: 'Harry Potter',
          iban: 'GB33BUKB20201555555555',
          address: {
            street: ['4 Privet Drive'],
            city: 'Little Whinging',
            postal_code: '11111',
            country: 'GB',
          },
        });
      const recipientId = createRecipientResponse.data.recipient_id;
      prettyPrintResponse(createRecipientResponse);

      const createPaymentResponse =
        await client.paymentInitiationPaymentCreate({
          recipient_id: recipientId,
          reference: 'paymentRef',
          amount: {
            value: 1.23,
            currency: 'GBP',
          },
        });
      prettyPrintResponse(createPaymentResponse);
      const paymentId = createPaymentResponse.data.payment_id;

      // We store the payment_id in memory for demo purposes - in production, store it in a secure
      // persistent data store along with the Payment metadata, such as userId.
      PAYMENT_ID = paymentId;

      const configs = {
        client_name: 'Plaid Quickstart',
        user: {
          // This should correspond to a unique id for the current user.
          // Typically, this will be a user ID number from your application.
          // Personally identifiable information, such as an email address or phone number, should not be used here.
          client_user_id: uuidv4(),
        },
        // Institutions from all listed countries will be shown.
        country_codes: PLAID_COUNTRY_CODES,
        language: 'en',
        // The 'payment_initiation' product has to be the only element in the 'products' list.
        products: [Products.PaymentInitiation],
        payment_initiation: {
          payment_id: paymentId,
        },
      };
      if (PLAID_REDIRECT_URI !== '') {
        configs.redirect_uri = PLAID_REDIRECT_URI;
      }
      const createTokenResponse = await client.linkTokenCreate(configs);
      prettyPrintResponse(createTokenResponse);
      response.json(createTokenResponse.data);
    })
    .catch(next);
}
