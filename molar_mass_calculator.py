import re    # Python’s regular expressions module
import json

# Load atomic mass data from JSON
with open("atomic_masses.json") as file:
    atomic_masses = json.load(file) 

# Ca(OH)2   this will return [('Ca', 1), ('O', 2), ('H', 2)]
def parse_formula(formula):
    tokens = re.findall(r'[A-Z][a-z]?|\d+|\(|\)', formula)   #re.findall(pattern, string)
    stack = [[]]
    i = 0

    while i < len(tokens):
        token = tokens[i]

        if token == '(':
            stack.append([])
        elif token == ')':
            group = stack.pop()
            i += 1
            multiplier = int(tokens[i]) if i < len(tokens) and tokens[i].isdigit() else 1
            if i < len(tokens) and tokens[i].isdigit():
                i += 1
            for elem, count in group:
                stack[-1].append((elem, count * multiplier))
            continue  #this means Go back to the beginning of the while loop, skip the rest of the code below.
        elif re.match(r'[A-Z][a-z]?', token):
            element = token
            i += 1
            count = int(tokens[i]) if i < len(tokens) and tokens[i].isdigit() else 1
            if i < len(tokens) and tokens[i].isdigit():
                i += 1
            stack[-1].append((element, count))
            continue
        else:
            i += 1

    return stack[0]  #This returns the top-level list, which holds the full parsed result of the formula.

# Calculate molar mass based on parsed formula
def calculate_molar_mass(formula):
    parsed = parse_formula(formula)
    total_mass = 0
    for element, count in parsed:
        if element not in atomic_masses:
            raise ValueError(f"Unknown element: {element}")
        total_mass += atomic_masses[element] * count
    return total_mass

if __name__ == "__main__":
    formula = input("Enter a chemical formula (e.g., Ca(OH)2): ")
    try:
        molar_mass = calculate_molar_mass(formula)
        print(f"Molar mass of {formula} = {molar_mass:.3f} g/mol")
    except ValueError as e:
        print(e)
