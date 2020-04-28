import { Database } from "sqlite3";
import { logBot } from "./logging_config";

const DB_PATH: string = "./db/song_queue.db";

// Create the tables if they aren't already in there
function createTables() {
  const createSongs: string = `CREATE TABLE IF NOT EXISTS songs (
        q_num INT,
        server TEXT,
        title TEXT,
        url TEXT
    )`;

  const createServerData: string = `CREATE TABLE IF NOT EXISTS server_data (
        server_name TEXT,
        curr_song INT,
        PRIMARY KEY(server_name)
    )`;

  const db = new Database(DB_PATH);
  db.run(createSongs);
  db.run(createServerData);
  db.close();
}

// Add a song to the queue for a server
function addToQueue(serverName: string, title: string, url: string) {
  const updateTable: string = `INSERT INTO songs(q_num, server, title, url)
    SELECT COUNT(q_num)+1, ?, ?, ? 
    FROM songs 
    WHERE server = ?`;

  const db = new Database(DB_PATH);
  db.run(updateTable, [serverName, title, url, serverName]);
  db.close();
}

// Pass the server name for the queue to be cleared for that server
function clearQueue(serverName: string) {
  const clearServerData: string = `UPDATE server_data SET curr_song = -1 WHERE server_name = ?`;
  const clearSongData: string = `DELETE FROM songs WHERE server = ?`;

  const db = new Database(DB_PATH);
  db.run(clearServerData, [serverName]);
  db.run(clearSongData, [serverName]);
  db.close();
}

// List all songs in the queue for this server
function listQueue(serverName: string) {
  const sql: string = `SELECT q_num, title FROM songs WHERE server = ? ORDER BY q_num`;
  const db = new Database(DB_PATH);
  let songList: any = [];
  db.all(sql, [serverName], (err, rows) => {
    songList = rows;
  });
  console.log(songList);
  return songList;
}

export { addToQueue, createTables, clearQueue, listQueue };
