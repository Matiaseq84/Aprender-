import { readFile, writeFile } from 'fs/promises'

export async function readData(DB_FILE)  {
    try {
        const data = await readFile(DB_FILE, 'utf-8')
        return JSON.parse(data)
        
    } catch {
        return []
    }
}

export async function writeData(DB_FILE, data) {
    await writeFile(DB_FILE, JSON.stringify(data, null, 2))
}