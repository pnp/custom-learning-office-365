import { ServiceKey } from "@microsoft/sp-core-library";
import {AadTokenProviderFactory} from "@microsoft/sp-http-base";

export interface IAuthService {
  Init: (aadTokenProviderFactory: AadTokenProviderFactory) => void;
  GetAADToken(resource: string): Promise<string>;
}

export class AuthService implements IAuthService {
  private LOG_SOURCE = "🟢AuthService";
  public static readonly serviceKey: ServiceKey<IAuthService> =
    ServiceKey.create<AuthService>("AuthService:IAuthService", AuthService);
  private _ready: boolean = false;
  private _aadTokenProvider: AadTokenProviderFactory;

  public constructor() { }

  public Init(aadTokenProviderFactory: AadTokenProviderFactory): void {
    this._ready = true;
    this._aadTokenProvider = aadTokenProviderFactory;
  }

  public get ready(): boolean {
    return this._ready;
  }
  
  public async GetAADToken(resource: string): Promise<string> {
    let retVal: string = null;
    try {
      const tokenProvider = await this._aadTokenProvider.getTokenProvider();
      retVal = await tokenProvider.getToken(resource);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (GetAADToken) ${err} `);
    }
    return retVal;
  }

}

export const authSvc:IAuthService = new AuthService();