const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
	const { username, password } = req.body;
	if (username && password) {
		if (!isValid(username)) {
			users.push({ username, password });
			return res
				.status(200)
				.json({ message: "User successfully registered. Now you can login" });
		} else {
			return res
				.status(404)
				.json({ message: `User ${username} already exists!` });
		}
	}
	return res.status(404).json({ message: "Missing or empty fields." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
	res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
	const isbn = req.params.isbn;
	if (books[isbn]) {
		res.send(JSON.stringify(books[isbn], null, 4));
	} else {
		res.status(404).json({ message: "Book not found" });
	}
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
	const author = req.params.author;
	let author_books = {};
	for (let book in books) {
		if (parsedString(books[book].author) === parsedString(author)) {
			author_books[book] = books[book];
		}
	}
	if (Object.keys(author_books).length > 0) {
		res.send(JSON.stringify(author_books, null, 4));
	} else {
		res.status(404).json({ message: "Author not found" });
	}
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
	const title = req.params.title;
	let title_books = {};
	for (let book in books) {
		if (parsedString(books[book].title) === parsedString(title)) {
			title_books[book] = books[book];
		}
	}
	if (Object.keys(title_books).length > 0) {
		res.send(JSON.stringify(title_books, null, 4));
	} else {
		res.status(404).json({ message: "Title not found" });
	}
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
	const reviews = books[req.params.isbn].reviews;
	if (reviews) {
		res.send(JSON.stringify(reviews, null, 4));
	} else {
		res.status(404).json({ message: "Book not found" });
	}
});

function parsedString(string) {
	return string.split(" ").join("").toLowerCase();
}

module.exports.general = public_users;
