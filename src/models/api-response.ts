export interface IApiResponse<Type> {
  status: boolean;
  messages: string[];
  data: Type | null;
}
