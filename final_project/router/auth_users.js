const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
	let filteredUsers = users.filter((user) => {
		return user.username === username;
	});
	if (filteredUsers.length > 0) {
		return true;
	} else {
		return false;
	}
};

const authenticatedUser = (username, password) => {
	let validusers = users.filter((user) => {
		return user.username === username && user.password === password;
	});
	if (validusers.length > 0) {
		return true;
	} else {
		return false;
	}
};

//only registered users can login
regd_users.post("/login", (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(404).json({ message: "Error logging in" });
	}
	if (authenticatedUser(username, password)) {
		let accessToken = jwt.sign(
			{
				data: password,
			},
			"access",
			{ expiresIn: 60 * 60 }
		);
		req.session.authorization = {
			accessToken,
			username,
		};
		return res.status(200).send("User successfully logged in");
	} else {
		return res
			.status(208)
			.json({ message: "Invalid Login. Check username and password" });
	}
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const review = req.body.review;
	const username = req.session.authorization.username;
	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	} else {
		for (let el in books[isbn].reviews) {
			if (el === username) {
				el.review = review;
				return res.status(200).json({ message: "Review updated successfully" });
			}
		}
		books[isbn].reviews = { ...books[isbn].reviews, [username]: { review } };

		return res.status(200).json({ message: "Review added successfully" });
	}
});

// Delete user review from book reviews
regd_users.delete("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const username = req.session.authorization.username;
	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	} else {
		if (books[isbn].reviews[username]) {
			delete books[isbn].reviews[username];
			return res.status(200).json({ message: "Review deleted successfully" });
		} else {
			return res.status(404).json({ message: "Review not found" });
		}
	}
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
