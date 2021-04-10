interface TwitchAuthOptions {
	/**
	 * Scopes to ask to the user
	 * @see https://dev.twitch.tv/docs/authentication#scopes
	 */
	scopes?: string[]
	/**
	 * Force the authentification to occursed, even if we have a valid token. defaults to false
	 */
	force?: Boolean
}

export declare class Twitch {
	private user;
	private tmi;
	private promiseUser:Promise;
	
	/**
	 * Ask the user to auth
	 */
	auth(options?: TwitchAuthOptions): Promise<null>;
	startChatOnChannel(channel?: string|string[]): undefined;
}
