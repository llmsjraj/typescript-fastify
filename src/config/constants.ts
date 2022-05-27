export class Constants {
  public static readonly Registration = 'Registration';
  public static readonly DefaultLocale = 'en';
  public static readonly PasswordLength = 10;
  public static readonly SaltRound = 10;
  public static readonly Registration_404_Description = 'Unauthorized Access';
  public static readonly Routes = class ApiRoutes {
    public static readonly Account = '/api/account';
    public static readonly AccountRegistration = '/register';
    public static readonly AccountActivation = '/activate';
    public static readonly ResendEmailActivation = '/resendEmailActivation';
  };
  public static readonly Swagger = class Swagger {
    public static readonly Route = '/swagger';
    public static readonly Title = 'Samle API';
    public static readonly Description = 'Sample API';
    public static readonly Version = '1.0.0';
  };
  public static readonly Type = class Type {
    public static readonly AccountService = 'AccountService';
    public static readonly ErrorService = 'ErrorService';
    public static readonly ConfigService = 'ConfigService';
    public static readonly EmailService = 'EmailService';
  };
  public static readonly ErrorMessages = class ErrorMessages {
    public static readonly ErrorKey = 'ERROR';
    public static readonly EmailAlreadyExist = 'EMAIL_ALREADY_EXIST';
    public static readonly MobileAlreadyExist = 'MOBILE_ALREADY_EXIST';
    public static readonly InvalidCity = 'MOBILE_ALREADY_EXIST';
    public static readonly InvalidCountry = 'MOBILE_ALREADY_EXIST';
    public static readonly EmailActivationTokenNotFound = 'EMAIL_ACTIVATION_TOKEN_NOT_FOUND';
    public static readonly AccountAlreadyActivated = 'ACCOUNT_ALREADY_ACTIVATED';
    public static readonly AccountNotFound = 'ACCOUNT_NOT_FOUND';
  };
}
