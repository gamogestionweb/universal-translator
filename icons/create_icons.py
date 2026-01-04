from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    # Crear imagen con fondo transparente
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Dibujar círculo con gradiente simulado
    center = size // 2
    radius = size // 2 - 1

    # Color base Twitter blue
    color = (29, 161, 242)

    # Círculo
    draw.ellipse([1, 1, size-2, size-2], fill=color)

    # Letra A
    font_size = int(size * 0.5)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("Arial.ttf", font_size)
        except:
            font = ImageFont.load_default()

    text = "A"
    # Obtener el bounding box del texto
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]

    draw.text((x, y), text, fill='white', font=font)

    return img

# Crear directorio si no existe
script_dir = os.path.dirname(os.path.abspath(__file__))

# Generar iconos
for size in [16, 48, 128]:
    icon = create_icon(size)
    path = os.path.join(script_dir, f'icon{size}.png')
    icon.save(path, 'PNG')
    print(f'Creado: icon{size}.png')

print('¡Iconos generados correctamente!')
