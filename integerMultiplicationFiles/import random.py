import random

def generate_large_numbers():
    """Generate a random large number greater than 100."""
    return random.randint(101, 10**6)  # Customize the upper limit if needed

def save_to_file(filename, x, y):
    """Save two large numbers to a file."""
    with open(filename, 'w') as file:
        file.write(f"{x}\n{y}\n")

def generate_integer_multiplication_files():
    """Generate 10 files with two numbers > 100."""
    for i in range(1, 11):
        x = generate_large_numbers()
        y = generate_large_numbers()
        filename = f"integers_{i}.txt"
        save_to_file(filename, x, y)
        print(f"Generated: {filename} with numbers {x} and {y}")

# Run the generator
if __name__ == "__main__":
    generate_integer_multiplication_files()
