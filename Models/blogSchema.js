import mongoose from "mongoose";
// import bcrypt from "bcrypt";

// schema for paragraph field because it have multiple paragraphs
const paragraphSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

// schema for the blogs
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: {type: String, required: true},
    paragraph: {
      type: [paragraphSchema],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
