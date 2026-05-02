import os
import re

input_file = r"c:\Users\mynam\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\A5575CC12FE5EA88EFFEA274CAC4EDE878CA0B8B\transfers\2026-15\FULLproject.txt"
base_dir = r"e:\Nextalk"

with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

files = {}
current_file = None

# It matches lines like:
# file : socketManager.js :-
# file: user.controller.js :-
# file :- App.css :-
file_pattern = re.compile(r"^file\s*[:-]?\s*(.*?)\s*:-")

for line in lines:
    # Some lines might literally be just FRONTEND :- or BACKEND :- we skip them
    if line.strip() in ["FRONTEND :-", "BACKEND :-"]:
        current_file = None
        continue
        
    match = file_pattern.search(line)
    if match:
        current_file = match.group(1).strip()
        files[current_file] = []
    elif current_file:
        files[current_file].append(line)

for k in list(files.keys()):
    content = "".join(files[k]).strip() + "\n"
    files[k] = content

mapping = {
    "socketManager.js": "backend/controllers/socketManager.js",
    "user.controller.js": "backend/controllers/user.controller.js",
    "meeting.model.js": "backend/models/meeting.model.js",
    "user.model.js": "backend/models/user.model.js",
    "user.routes.js": "backend/routes/users.routes.js",
    "app.js": "backend/app.js",
    "AuthContext.jsx": "frontend/src/contexts/AuthContext.jsx",
    "authentication.jsx": "frontend/src/pages/authentication.jsx",
    "history.jsx": "frontend/src/pages/history.jsx",
    "home.jsx": "frontend/src/pages/home.jsx",
    "landing.jsx": "frontend/src/pages/landing.jsx",
    "videoMeet.jsx": "frontend/src/pages/VideoMeet.jsx",
    "videoComponentModule.css": "frontend/src/styles/videoComponent.module.css",
    "chatbot.css": "frontend/src/components/chatbot.css",
    "withAuth.jsx": "frontend/src/utils/withAuth.jsx",
    "App.css": "frontend/src/App.css",
    "App.js": "frontend/src/App.js"
}

for raw_name, relative_path in mapping.items():
    matched_key = None
    for k in files.keys():
        if raw_name.strip() == k.strip():
            matched_key = k
            break
            
    if matched_key:
        full_path = os.path.join(base_dir, relative_path.replace("/", os.sep))
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(files[matched_key])
        print(f"Created {full_path}")
    else:
        print(f"Warning: Could not find content for {raw_name}")
