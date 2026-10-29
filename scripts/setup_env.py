import urllib.parse
import pathlib

env_path = pathlib.Path('.env')
content = env_path.read_text(encoding='utf-8')

neon_url = None
for line in content.splitlines():
    line = line.strip()
    if line.startswith('NEON_DATABASE_URL='):
        neon_url = line.split('=', 1)[1].strip().strip('"').strip("'")
        break

if neon_url:
    parsed = urllib.parse.urlparse(neon_url)
    db_user = parsed.username or ''
    db_password = parsed.password or ''
    db_host = parsed.hostname or ''
    db_name = parsed.path.lstrip('/') or 'neondb'
    
    append_lines = []
    if 'DB_HOST=' not in content:
        append_lines.append(f'DB_HOST={db_host}')
    if 'DB_NAME=' not in content:
        append_lines.append(f'DB_NAME={db_name}')
    if 'DB_USER=' not in content:
        append_lines.append(f'DB_USER={db_user}')
    if 'DB_PASSWORD=' not in content:
        append_lines.append(f'DB_PASSWORD={db_password}')
    if 'DB_URL=' not in content:
        append_lines.append(f'DB_URL=jdbc:postgresql://{db_host}/{db_name}?sslmode=require&prepareThreshold=0')
    if 'DB_OWNER_USER=' not in content:
        append_lines.append(f'DB_OWNER_USER={db_user}')
    if 'DB_OWNER_PASSWORD=' not in content:
        append_lines.append(f'DB_OWNER_PASSWORD={db_password}')
    if 'DB_APP_USER=' not in content:
        append_lines.append(f'DB_APP_USER={db_user}')
    if 'DB_APP_PASSWORD=' not in content:
        append_lines.append(f'DB_APP_PASSWORD={db_password}')
    
    if append_lines:
        new_content = content.rstrip() + '\n\n# Derived Spring Boot JDBC credentials for NeonDB\n' + '\n'.join(append_lines) + '\n'
        env_path.write_text(new_content, encoding='utf-8')
        print('Updated .env with derived DB parameters.')
    else:
        print('.env already contains derived DB parameters.')

# Create .env.example
env_example = """# NeonDB Connection URL
NEON_DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Better Auth Secret
BETTER_AUTH_SECRET=your_32_byte_base64_secret_here

# CodeRabbit API Key
CODERABBIT_API_KEY=cr-your_coderabbit_api_key_here

# GitHub Repo URL
GITHUB_REPO_URL=https://github.com/srijans123/IncidentZero

# Derived Spring Boot JDBC credentials (can be left blank or filled automatically)
DB_HOST=ep-sample-pooler.ap-southeast-1.aws.neon.tech
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=YOUR_PASSWORD
DB_URL=jdbc:postgresql://ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&prepareThreshold=0
DB_OWNER_USER=neondb_owner
DB_OWNER_PASSWORD=YOUR_PASSWORD
DB_APP_USER=neondb_owner
DB_APP_PASSWORD=YOUR_PASSWORD
"""
pathlib.Path('.env.example').write_text(env_example, encoding='utf-8')
print('Created .env.example')
