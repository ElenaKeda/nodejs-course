const db = require("../util/database");

const Cart = require("./cart");

module.exports = class Product {
  constructor({ id, title, imageUrl, price, description }) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
    return db.execute(
      "INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)",
      [this.title, this.price, this.imageUrl, this.description],
    );
  }

  update() {
    return db.execute(
      `UPDATE products 
        SET title = ?, imageUrl = ?, price = ?, description = ?
        WHERE id = ?`,
      [this.title, this.imageUrl, this.price, this.description, this.id],
    );
  }

  static deleteById(id) {
    return db.execute("DELETE FROM products WHERE id = ?", [id]);
  }

  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(id) {
    return db.execute("SELECT * FROM products WHERE id = ?", [id]);
  }
};
