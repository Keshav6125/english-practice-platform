import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start backend server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

// Start frontend development server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down development servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

// Handle errors
backend.on('error', (error) => {
  console.error('Backend server error:', error);
});

frontend.on('error', (error) => {
  console.error('Frontend server error:', error);
});

console.log('Starting development servers...');
console.log('Frontend will be available at http://localhost:5173');
console.log('Backend API will be available at http://localhost:3001');