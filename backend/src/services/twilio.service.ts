import twilio from 'twilio';

export class TwilioService {
  private static getClientConfig() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    const isValid = !!(accountSid && authToken && fromNumber &&
      !accountSid.startsWith('your_') &&
      !authToken.startsWith('your_') &&
      !fromNumber.startsWith('your_'));

    return { accountSid, authToken, fromNumber, isValid };
  }

  static async sendSms(to: string, body: string): Promise<string> {
    const config = this.getClientConfig();

    if (!config.isValid || !config.accountSid || !config.authToken || !config.fromNumber) {
      throw new Error('Twilio credentials are not configured or are still using default placeholders.');
    }

    const client = twilio(config.accountSid, config.authToken);
    const message = await client.messages.create({
      body: body || 'Hello from Doctor Appointment App!',
      from: config.fromNumber,
      to,
    });

    return message.sid;
  }
}
