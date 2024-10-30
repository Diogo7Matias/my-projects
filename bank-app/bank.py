import tkinter
import customtkinter as tk
import os
from PIL import Image
import random

MAXLENGTH = 8

account = {
    "id": None,
    "username": None,
    "password": None,
    "balance": 0
}

tk.set_appearance_mode("System")
tk.set_default_color_theme("blue")

app = tk.CTk()
app.geometry("700x550")
app.title("LeBank")
app.minsize(700, 550)
app.columnconfigure(0, weight=1)
app.rowconfigure(0, weight=1)

def login():
    global account
    username = lUsernameEntry.get()
    password = lPasswordEntry.get()
    found = False
    
    if not os.path.exists("data.txt"):
        f = open("data.txt", 'x')

    f = open("data.txt")

    for line in f.readlines():
        if line.split()[1] == username and line.split()[2] == password:
            account["id"] = int(line.split()[0])
            account["username"] = username
            account["password"] = password
            account["balance"] = float(line.split()[3])
            found = True
            mainPage()
            break

    if not found:
        lErrorMessage.grid(row=6)

    f.close()
        
def register():
    username = rUsernameEntry.get()
    password = rPasswordEntry.get()
    conflictingUsername = False

    if not os.path.exists("data.txt"):
        f = open("data.txt", 'x')

    f = open("data.txt", 'r+')

    if ' ' in username:
        message("Username can't contain spaces.")
        f.close()
        return
    if ' ' in password:
        message("Password can't contain spaces.")
        f.close()
        return
    if len(username) > MAXLENGTH:
        message("Username is too long.")
        f.close()
        return
    if len(password) > MAXLENGTH:
        message("Password is too long.")
        f.close()
        return

    for line in f.readlines():
        if line.split()[1] == username:
            conflictingUsername = True
            break

    if conflictingUsername:
        rErrorMessage.grid(row=6)
    else:
        f.write(f"{generateID()} {username} {password} 0\n")
        regSuccessPage()

    f.close()

def generateID():
    generateNewID = True

    while generateNewID:
        id = random.randint(0, 5000)
        generateNewID = False

        with open("data.txt") as f:
            for line in f.readlines():
                if line.split()[0] == str(id):
                    generateNewID = True
                    break
    
    return id

def closeWindow():
    msgWindow.destroy()

def message(msg):
    global msgWindow
    msgWindow = tk.CTkToplevel(app)
    msgWindow.title("Message")
    msgWindow.geometry("400x100")
    msgWindow.resizable(False, False)

    msgLabel = tk.CTkLabel(msgWindow, font=("default", 20), text=f"{msg}")
    msgLabel.pack(pady=10)

    okButton = tk.CTkButton(msgWindow, text="OK", command=closeWindow)
    okButton.pack()

def updateAccountInfo(item):
    lineNumber = 0

    if item == 'username':
        welcomeText.configure(text=f"Welcome to LeBank, {account[item]}.\nChoose the operation you would like to make.")
        usernameText.configure(text=f"Username: {account[item]}")
    elif item == 'password':
        passwordText.configure(text=f"Password: {account[item]}")
    elif item == 'balance':
        balanceDisplay.configure(text=f"Balance: ${account[item]}")

    # writes account info to the file
    with open("data.txt") as f:
        lines = f.readlines()
        for line in lines:
            if line.split()[0] == str(account['id']):
                lines[lineNumber] = f'{account["id"]} {account["username"]} {account["password"]} {account["balance"]}\n'
                break
            lineNumber += 1

    with open("data.txt", 'w') as f:
        f.writelines(lines)

def deposit():
    dialog = tk.CTkInputDialog(title="Deposit", text="Deposit:")
    input = dialog.get_input()
    
    if input == None:
        return

    onlyDigits = input.replace(".", "", 1)

    if not onlyDigits.isdigit():
        message("Invalid input.")
        return
    
    account["balance"] += float(input)
    updateAccountInfo("balance")

def withdraw():
    dialog = tk.CTkInputDialog(title="Withdraw", text="Withdraw:")
    input = dialog.get_input()

    if input == None:
        return

    onlyDigits = input.replace(".", "", 1)

    if not onlyDigits.isdigit() or float(input) > account["balance"]:
        message("Invalid input.")
        return
    
    account["balance"] -= float(input)
    updateAccountInfo("balance")

def registerPage():
    if loginFrame.grid_info(): # if this is empty then regFrame is not active
        loginFrame.grid_forget()

    regFrame.grid(row=0, column=0)
    regFrame.configure(width=200, height=340)
    regFrame.grid_propagate(False)
    regFrame.grid_columnconfigure(0, weight=1)

def regSuccessPage():
    regFrame.grid_forget()
    regSuccessFrame.grid(row=0, column=0)
    regSuccessFrame.configure(width=400, height=180)
    regSuccessFrame.grid_propagate(False)
    regSuccessFrame.grid_columnconfigure(0, weight=1)
    regSuccessFrame.grid_rowconfigure((0, 1), weight=1)
    regSuccessFrame.grid_rowconfigure(2, weight=4)

def loginPage():
    if regFrame.grid_info():
        regFrame.grid_forget()
    if regSuccessFrame.grid_info():
        regSuccessFrame.grid_forget()
    if mainFrame.grid_info():
        mainFrame.grid_forget()

    loginFrame.grid(row=0, column=0)
    loginFrame.configure(width=200, height=340)
    loginFrame.grid_propagate(False)
    loginFrame.grid_columnconfigure(0, weight=1)

def checkEntries(*args):
    if len(rUsernameEntry.get()) != 0 and len(rPasswordEntry.get()) != 0:
        regButton.configure(state=tk.NORMAL)
    else:
        regButton.configure(state=tk.DISABLED)

def mainPage():
    loginFrame.grid_forget()

    if accountFrame.grid_info():
        accountFrame.grid_forget()

    mainFrame.grid(column=0, row=0, sticky='nsew')
    updateAccountInfo("balance")
    updateAccountInfo("username")

def accountPage():
    mainFrame.grid_forget()
    accountFrame.grid(column=0, row=0)
    accountFrame.configure(width=450, height=200)
    accountFrame.grid_propagate(False)
    updateAccountInfo("username")
    updateAccountInfo("password")

def changeUsername():
    dialog = tk.CTkInputDialog(title="Acoount", text="New Username:")
    input = dialog.get_input()
    conflictingUsername = False
    
    if not input or input == None:
        return

    if ' ' in input:
        message("Username can't contain spaces.")
        return
    
    if len(input) > MAXLENGTH:
        message("Username is too long.")
        return
    
    if input == account['username']:
        message("Must be different from previous username.")
        return
    
    with open("data.txt") as f:
        for line in f.readlines():
            if line.split()[1] == str(input):
                conflictingUsername = True
                break

    if conflictingUsername:
        message("Username already exists.")
    else:
        account["username"] = input
        updateAccountInfo("username")
    
def changePassword():
    dialog = tk.CTkInputDialog(title="Acoount", text="New Password:")
    input = dialog.get_input()
    
    if not input or input == None:
        return

    if ' ' in input:
        message("Password can't contain spaces.")
        return
    
    if len(input) > MAXLENGTH:
        message("Password is too long.")
        return
    
    if input == account['password']:
        message("Must be different from previous password.")
        return
    
    account["password"] = input
    updateAccountInfo("password")

#    --- Main Frame (after login) ---
mainFrame = tk.CTkFrame(app, fg_color="transparent")
mainFrame.columnconfigure((0, 1, 2), weight=1)
mainFrame.rowconfigure(0, weight=1)
mainFrame.rowconfigure(1, weight=1)
mainFrame.rowconfigure((2, 3), weight=3)

# Row 0
bankName = tk.CTkLabel(mainFrame, font=("default", 42), text="LeBank")
bankName.grid(row=0, column=0, padx=20, pady=20, sticky='nw')

balanceDisplay = tk.CTkLabel(mainFrame, font=("default", 28), text=f'Balance: ${account["balance"]}')
balanceDisplay.grid(row=0, column=1, pady=20, sticky='n')

userImage = tk.CTkImage(Image.open("user.png"), size=(50, 50))
logOut = tk.CTkButton(mainFrame, image=userImage, text="Log Out", command=loginPage)
logOut.grid(row=0, column=2, padx=20, pady=20, sticky="ne")

# Row 1
welcomeText = tk.CTkLabel(mainFrame, font=("default", 28), text=f'Welcome to LeBank, {account["username"]}.\nChoose the operation you would like to make.')
welcomeText.grid(row=1, column=0, columnspan=3)

# Row 2
buttons = tk.CTkFrame(mainFrame, fg_color="transparent")
buttons.grid(row=2, column=0, columnspan=3)
depositButton = tk.CTkButton(buttons, text="Deposit", command=deposit)
depositButton.pack(pady=10)
withdrawButton = tk.CTkButton(buttons, text="Withdraw", command=withdraw)
withdrawButton.pack(pady=10)
manageButton = tk.CTkButton(buttons, text="Manage Account", command=accountPage)
manageButton.pack(pady=10)

#   --- Account Frame ---

accountFrame = tk.CTkFrame(app, fg_color="transparent")
accountFrame.grid_rowconfigure((0, 1, 2, 3), weight=1)
accountFrame.grid_columnconfigure((0, 1), weight=1)

manageAccountTitle = tk.CTkLabel(accountFrame, font=("default", 36), text="MANAGE ACCOUNT")
manageAccountTitle.grid(row=0, column=0, pady=5, columnspan=2)

usernameText = tk.CTkLabel(accountFrame, font=("default", 28), text=f"Username: {account['username']}")
usernameText.grid(row=1, column=0, padx=10, pady=5, sticky='e')

changeUsernameButton = tk.CTkButton(accountFrame, text="Change", command=changeUsername)
changeUsernameButton.grid(row=1, column=1, padx=5, pady=5, sticky='w')

passwordText = tk.CTkLabel(accountFrame, font=("default", 28), text=f"Password: {account['password']}")
passwordText.grid(row=2, column=0, padx=10, pady=5, sticky='e')

changePasswordButton = tk.CTkButton(accountFrame, text="Change", command=changePassword)
changePasswordButton.grid(row=2, column=1, padx=5, pady=5, sticky='w')

backButton = tk.CTkButton(accountFrame, text="Back", command=mainPage)
backButton.grid(row=3, column=0, columnspan=2, pady=10)

#   --- Register Frame ---

regFrame = tk.CTkFrame(app)
regFrame.grid(row=0, column=0)
regFrame.grid_propagate(False)
regFrame.grid_columnconfigure(0, weight=1)

loginFrameTitle = tk.CTkLabel(regFrame, font=("default", 28), text="REGISTER")
loginFrameTitle.grid(pady=10)

# username & password
rUsernameLabel = tk.CTkLabel(regFrame, font=("default", 16), text="Username:")
rUsernameLabel.grid()
rUsername = tkinter.StringVar()
rUsername.trace_add("write", checkEntries)
rUsernameEntry = tk.CTkEntry(regFrame, textvariable=rUsername)
rUsernameEntry.grid()

rPasswordLabel = tk.CTkLabel(regFrame, font=("default", 16), text="Password:")
rPasswordLabel.grid()
rPassword = tkinter.StringVar()
rPassword.trace_add("write", checkEntries)
rPasswordEntry = tk.CTkEntry(regFrame, textvariable=rPassword)
rPasswordEntry.grid()

# register button
regButton = tk.CTkButton(regFrame, text="Register", command=register)
regButton.grid(pady=15)
regButton.configure(state=tk.DISABLED)

# error message
rErrorMessage = tk.CTkLabel(regFrame, text="Username already exists.", text_color="#ff192c")

# change to login page
loginPageText = tk.CTkLabel(regFrame, text="------------------------")
loginPageText.grid(row=7)
loginPageButton = tk.CTkButton(regFrame, text="Log In", fg_color="#32728a", command=loginPage)
loginPageButton.grid(row=8)

#   --- Register Success Frame ---

regSuccessFrame = tk.CTkFrame(app)

successLabel = tk.CTkLabel(regSuccessFrame,font=("default", 28), text="SUCCESS")
successLabel.grid(pady=5)

successText = tk.CTkLabel(regSuccessFrame, font=("default", 16), text="Your account has been successfully created.\n\nYou can now return to the Log In page.")
successText.grid()

returnButton = tk.CTkButton(regSuccessFrame, text="Return", command=loginPage)
returnButton.grid()

#    --- Login Frame ---

loginFrame = tk.CTkFrame(app)
loginPage() # this will be the first page

loginFrameTitle = tk.CTkLabel(loginFrame, font=("default", 28), text="LOG IN")
loginFrameTitle.grid(pady=10)

# username & password
lUsernameLabel = tk.CTkLabel(loginFrame, font=("default", 16), text="Username:")
lUsernameLabel.grid()
lUsername = tkinter.StringVar()
lUsernameEntry = tk.CTkEntry(loginFrame, textvariable=lUsername)
lUsernameEntry.grid()

lPasswordLabel = tk.CTkLabel(loginFrame, font=("default", 16), text="Password:")
lPasswordLabel.grid()
lPassword = tkinter.StringVar()
lPasswordEntry = tk.CTkEntry(loginFrame, textvariable=lPassword)
lPasswordEntry.grid()

# login button
loginButton = tk.CTkButton(loginFrame, text="Log In", command=login)
loginButton.grid(pady=15)

# error message
lErrorMessage = tk.CTkLabel(loginFrame, text="invalid username or password.", text_color="#ff192c")

# change to register page
registerPageText = tk.CTkLabel(loginFrame, text="------------------------")
registerPageText.grid(row=7)
registerPageButton = tk.CTkButton(loginFrame, text="Register", fg_color="#32728a", command=registerPage)
registerPageButton.grid(row=8)

# runs the app
app.mainloop()
