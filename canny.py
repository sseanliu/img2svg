import numpy as np
import matplotlib.pyplot as plt
from scipy import ndimage as ndi
from skimage.util import random_noise
from skimage import feature
from skimage.io import imread
from skimage.color import rgb2gray
import svgwrite
import os
from skimage.morphology import skeletonize
from scipy.interpolate import splprep, splev
from io import StringIO

def smooth_path(points, smoothing=1.0):
    """Smooth a path using B-spline interpolation."""
    if len(points) < 4:
        return points
    
    # Separate x and y coordinates
    x = [p[0] for p in points]
    y = [p[1] for p in points]
    
    # Fit B-spline
    try:
        tck, u = splprep([x, y], s=smoothing, k=3)
        # Create more points than original for smoother curve
        u_new = np.linspace(0, 1, len(points) * 2)
        # Get new smoothed coordinates
        new_points = splev(u_new, tck)
        return list(zip(new_points[0], new_points[1]))
    except:
        return points  # Return original points if smoothing fails

def trace_path(edges):
    """Trace a path through edge pixels."""
    height, width = edges.shape
    paths = []
    visited = np.zeros_like(edges, dtype=bool)
    
    def get_neighbors(y, x):
        """Get unvisited neighboring edge pixels."""
        neighbors = []
        for dy in [-1, 0, 1]:
            for dx in [-1, 0, 1]:
                if dy == 0 and dx == 0:
                    continue
                ny, nx = y + dy, x + dx
                if (0 <= ny < height and 0 <= nx < width and 
                    edges[ny, nx] and not visited[ny, nx]):
                    neighbors.append((ny, nx))
        return neighbors
    
    def trace_from(start_y, start_x):
        """Trace a single path starting from given point."""
        current_path = [(start_x, start_y)]
        visited[start_y, start_x] = True
        
        current_y, current_x = start_y, start_x
        while True:
            neighbors = get_neighbors(current_y, current_x)
            if not neighbors:
                break
            
            # Choose the next pixel (here we take the first neighbor)
            next_y, next_x = neighbors[0]
            current_path.append((next_x, next_y))
            visited[next_y, next_x] = True
            current_y, current_x = next_y, next_x
            
        return current_path

    # Find all paths
    for y in range(height):
        for x in range(width):
            if edges[y, x] and not visited[y, x]:
                path = trace_from(y, x)
                if len(path) > 1:  # Only keep paths with more than one point
                    paths.append(path)
    
    return paths

def edges_to_svg_string(edges, frame_size=256):
    """Convert edges to SVG string content and scale to fit frame_size."""
    # Thin the edges to single pixel width
    edges = skeletonize(edges)
    
    height, width = edges.shape
    
    # Calculate scale factor to fit within frame_size while maintaining aspect ratio
    scale_x = frame_size / width
    scale_y = frame_size / height
    scale = min(scale_x, scale_y)
    
    # Calculate dimensions that maintain aspect ratio
    scaled_width = width * scale
    scaled_height = height * scale
    
    # Calculate centering offsets
    x_offset = (frame_size - scaled_width) / 2
    y_offset = (frame_size - scaled_height) / 2
    
    output = StringIO()
    dwg = svgwrite.Drawing(size=(frame_size, frame_size), viewBox=f"0 0 {frame_size} {frame_size}")
    
    # Create a group for the paths with transform for scaling and centering
    g = dwg.g(transform=f"translate({x_offset},{y_offset}) scale({scale})")
    
    # Trace paths through the edges
    paths = trace_path(edges)
    
    # Create SVG paths
    for path in paths:
        if len(path) > 1:
            # Use original coordinates since we're scaling with transform
            smoothed_path = smooth_path(path, smoothing=1.0)
            
            if len(smoothed_path) > 1:
                # Create path data string with rounded coordinates
                path_data = f"M {round(smoothed_path[0][0], 1)},{round(smoothed_path[0][1], 1)}"
                
                # Add smooth curve segments
                for i in range(1, len(smoothed_path)):
                    path_data += f" L {round(smoothed_path[i][0], 1)},{round(smoothed_path[i][1], 1)}"
                
                # Add path to the group
                g.add(dwg.path(
                    d=path_data,
                    stroke='black',
                    stroke_width=0.5,
                    stroke_linejoin='round',
                    stroke_linecap='round',
                    fill='none'
                ))
    
    # Add the group to the drawing
    dwg.add(g)
    
    # Save to string
    dwg.write(output)
    return output.getvalue()

if __name__ == "__main__":
    # Read and convert the image to grayscale
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(script_dir, 'temp', 'test.png')

    image = imread(image_path)
    if image.ndim == 3:  # If the image is RGB or RGBA
        if image.shape[2] == 4:  # If RGBA, remove alpha channel
            image = image[..., :3]
        image = rgb2gray(image)

    # Compute the Canny filter for two values of sigma
    edges1 = feature.canny(image)
    edges2 = feature.canny(image, sigma=2)

    # Convert edges to SVG strings with fixed frame size
    svg1 = edges_to_svg_string(edges1, frame_size=256)
    svg2 = edges_to_svg_string(edges2, frame_size=256)

    # Print SVG strings to be captured by the Node.js process
    print("SVG_CONTENT_START")  # Marker for parsing
    print(svg1)
    print("SVG_CONTENT_SEPARATOR")  # Separator between SVGs
    print(svg2)
    print("SVG_CONTENT_END")  # End marker