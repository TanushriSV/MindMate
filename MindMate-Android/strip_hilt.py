import os
import re

base_dir = r"c:\Users\Tanushri\Downloads\MindMate\MindMate-Android\app\src\main\java\com\mindmate\app"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Remove Hilt annotations
    content = re.sub(r'@HiltViewModel\n', '', content)
    content = re.sub(r'@AndroidEntryPoint\n', '', content)
    content = re.sub(r'@HiltAndroidApp\n', '', content)
    content = re.sub(r'@Singleton\n', '', content)
    
    # Remove @Inject constructor(...) -> constructor(...)
    content = re.sub(r'@Inject\s+constructor', 'constructor', content)
    
    # Remove Hilt imports
    content = re.sub(r'import dagger\..*\n', '', content)
    content = re.sub(r'import javax\.inject\..*\n', '', content)
    
    # Replace hiltViewModel() with viewModel(factory = AppViewModelProvider.Factory)
    if 'hiltViewModel()' in content:
        content = re.sub(r'import androidx\.hilt\.navigation\.compose\.hiltViewModel\n', 'import androidx.lifecycle.viewmodel.compose.viewModel\nimport com.mindmate.app.viewmodel.AppViewModelProvider\n', content)
        content = content.replace('hiltViewModel()', 'viewModel(factory = AppViewModelProvider.Factory)')
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified: {filepath}")

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.kt'):
            process_file(os.path.join(root, file))
