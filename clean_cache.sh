#!/bin/bash

# Remove Python cache files and directories
echo "Removing Python cache files..."

# Remove __pycache__ directories recursively
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null

# Remove .pyc files
find . -name "*.pyc" -delete 2>/dev/null

# Remove .pyo files (optimized Python bytecode)
find . -name "*.pyo" -delete 2>/dev/null

# Remove .pyd files (Python extension modules on Windows)
find . -name "*.pyd" -delete 2>/dev/null

echo "Python cache files removed successfully!"

# Mark the unmerged paths as resolved
echo "Marking unmerged cache files as resolved..."
git rm backend/__pycache__/main.cpython-313.pyc 2>/dev/null
git rm backend/api/__pycache__/__init__.cpython-313.pyc 2>/dev/null
git rm backend/api/routes/__pycache__/__init__.cpython-313.pyc 2>/dev/null
git rm backend/api/routes/__pycache__/openai.cpython-313.pyc 2>/dev/null
git rm backend/api/types/__pycache__/__init__.cpython-313.pyc 2>/dev/null
git rm backend/api/types/__pycache__/openai_types.cpython-313.pyc 2>/dev/null

echo "Unmerged cache files marked as resolved!"
echo "You can now run 'git commit' to complete the merge." 