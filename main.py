import tkinter
import customtkinter as tk
import os

tk.set_appearance_mode("System")
tk.set_default_color_theme("blue")

app = tk.CTk()
app.geometry("600x500")
app.title("Banco Fixe")
app.columnconfigure(0, weight=1)
app.rowconfigure(0, weight=1)

def login():
    username = lUsernameEntry.get()
    password = lPasswordEntry.get()
    found = False
    
    if not os.path.exists("data.txt"):
        f = open("data.txt", 'x')

    f = open("data.txt")

    for line in f.readlines():
        if line.split()[0] == username and line.split()[1] == password:
            mainPage()
            found = True
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

    for line in f.readlines():
        if line.split()[0] == username:
            conflictingUsername = True
            break

    if conflictingUsername:
        rErrorMessage.grid(row=6)
    else:
        f.write(f"{username} {password}\n")
        regSuccessPage()

    f.close()

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
    mainFrame.grid()

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

#    --- Main Frame (after login) ---
mainFrame = tk.CTkFrame(app)
mainFrame.grid_rowconfigure(0, weight=1)
mainFrame.grid_columnconfigure(0, weight=1)

# runs the app
app.mainloop()
