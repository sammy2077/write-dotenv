import {join} from 'path'
import {readFileSync, writeFileSync} from "fs";
import dotenv from "dotenv"


interface Env {
    [name: string]: string
}

interface Opt {
    path?: string
    environment?: string
}

export const updateDotenv = async (env: Env, options: Opt = {}) => {

    const escapeNewlines = (str: string) => str.replace(/\n/g, '\\n')


    const format = (key: string, value: string) => `${key}=${escapeNewlines(value)}`

    const envFileName = options.environment ? `.env.${options.environment}` : '.env'

    const filename = options.path || join(process.cwd(), envFileName)

    // Merge with existing values
    try {
        const existing = dotenv.parse(readFileSync(filename, 'utf-8'))
        env = Object.assign(existing, env)
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err
        }
    }

    const contents = Object.keys(env).map(key => format(key, env[key])).join('\n')
    writeFileSync(filename, contents)

    // Update current env with new values
    Object.assign(process.env, env)

    return env
}
export * from './aws'
