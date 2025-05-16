import { Idl } from '@project-serum/anchor';
import musicTokenFactoryJson from './music_token_factory.json';

// Type assertion to make TypeScript happy
export const IDL = musicTokenFactoryJson as Idl;

export default IDL; 