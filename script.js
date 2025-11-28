const accounts = [
    { username: "alice", password: "1234" },
    { username: "bob", password: "abcd" },
    { username: "carl", password: "pass" },
    { username: "diana", password: "1111" },
    { username: "eric", password: "0000" }
];

function login() {
    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    let found = accounts.find(a => a.username === user && a.password === pass);

    if(found) {
        localStorage.setItem("loggedUser", user);
        window.location.href = "home.html";
    } else {
        document.getElementById("loginError").textContent = "Invalid credentials.";
    }
}