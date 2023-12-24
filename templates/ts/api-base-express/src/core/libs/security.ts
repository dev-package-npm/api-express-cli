import bcrypt from "bcryptjs";
import Cryptr from 'cryptr';
import jwt from 'jsonwebtoken';


export const cryptr = new Cryptr(String(process.env.KEY));

export abstract class Security {
    public cryptr: Cryptr = cryptr;

    /**
     * Genrate hash for passwordss
     * @param password 
     * @param rounds default 10
     * @returns 
     */
    public async passwordHash(password: string, rounds: number = 10): Promise<string> {
        const salt = await bcrypt.genSalt(rounds);
        return await bcrypt.hash(password, salt);
    }

    /**
     * Validate the password is correct
     * @param password Format string
     * @param passwordEncrypted 
     * @returns 
     */
    public async passwordVerify(password: any, passwordEncrypted: string): Promise<boolean> {
        return await bcrypt.compare(password, passwordEncrypted);
    }

    public createToken(data: jwt.JwtPayload, options?: jwt.SignOptions): string {
        return jwt.sign(data, process.env.KEY || 'SecretKey1234', options);
    }

    public decryptToken(token: string, options?: jwt.DecodeOptions) {
        return jwt.decode(token, options);
    }

    public verifyToken(token: string, options?: jwt.VerifyOptions) {
        return jwt.verify(token, process.env.KEY || 'SecretKey1234', options);
    }
}