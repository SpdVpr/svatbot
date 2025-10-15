import re

# Read the file
with open('src/components/dashboard/FreeDragDrop.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace canvas background
content = content.replace(
    'className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden touch-none mx-auto"',
    'className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden touch-none mx-auto"'
)

# Replace grid colors
content = content.replace('rgba(0,0,0,0.05)', 'rgba(147,51,234,0.06)')
content = content.replace('rgba(0,0,0,0.08)', 'rgba(147,51,234,0.08)')

# Replace module borders
content = content.replace(
    'rounded-lg overflow-hidden shadow-lg bg-white border-2',
    'rounded-xl overflow-hidden shadow-md bg-white border'
)

# Replace border colors
content = re.sub(
    r"isDragging\s*\?\s*'border-primary-300'",
    "isDragging\n          ? 'border-primary-400 shadow-2xl'",
    content
)
content = re.sub(
    r"module\.isLocked\s*\?\s*'border-gray-300'",
    "module.isLocked\n          ? 'border-gray-200'",
    content
)
content = re.sub(
    r"isEditMode\s*\?\s*'border-primary-200 border-opacity-50'",
    "isEditMode\n          ? 'border-primary-100'",
    content
)
content = re.sub(
    r": 'border-transparent'",
    ": 'border-gray-100 hover:border-primary-200'",
    content
)

# Fix outer div - add rounded corners and remove shadow from outer div
content = content.replace(
    'className={`absolute group select-none ${',
    'className={`absolute group select-none rounded-xl ${'
)

# Remove shadow from outer div hover states and make animation smoother
content = content.replace(
    "? 'z-50 scale-105 shadow-2xl cursor-grabbing'",
    "? 'z-50 scale-105 cursor-grabbing'"
)
content = content.replace(
    "? 'z-10 hover:z-20 cursor-grab hover:shadow-lg hover:scale-[1.02] transition-all duration-200'",
    "? 'z-10 hover:z-20 cursor-grab hover:scale-[1.01] transition-all duration-300 ease-out'"
)
content = content.replace(
    ": 'z-10 hover:scale-[1.02] hover:shadow-lg transition-all duration-200'",
    ": 'z-10 hover:scale-[1.01] transition-all duration-300 ease-out'"
)

# Update inner div shadow to be more modern
content = content.replace(
    'className={`relative w-full h-full rounded-xl overflow-hidden shadow-md bg-white border transition-all ${',
    'className={`relative w-full h-full rounded-xl overflow-hidden bg-white border transition-all shadow-sm hover:shadow-xl ${'
)

# Write back
with open('src/components/dashboard/FreeDragDrop.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Canvas fixed - white background, purple grid, and modern shadows!")

