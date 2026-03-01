import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

const normalize = (value) => (value || "").trim().toLowerCase();

export default function UsersDao(db) {
  const createUser = (user) => {
    const { _id, ...userWithoutId } = user;
    const username = user.username ?? user.loginId ?? "";
    const password = user.password ?? username;
    const newUser = {
      ...userWithoutId,
      _id: uuidv4(),
      username,
      loginId: userWithoutId.loginId ?? username,
      password,
    };
    return model.create(newUser);
  };

  const findAllUsers = () => model.find();

  const findUsersByRole = (role) => model.find({ role });

  const findUsersByPartialName = (partialName) => {
    const regex = new RegExp(partialName, "i");
    return model.find({
      $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
    });
  };

  const findUserById = (userId) => model.findById(userId);

  const findUserByUsername = async (username) => {
    const users = await model.find({
      $or: [{ username: { $exists: true } }, { loginId: { $exists: true } }],
    });
    return users.find(
      (user) =>
        normalize(user.username) === normalize(username) ||
        normalize(user.loginId) === normalize(username)
    );
  };

  const findUserByCredentials = async (username, password) => {
    const user = await findUserByUsername(username);
    if (!user) return null;
    const storedPassword = user.password ?? user.loginId;
    return normalize(storedPassword) === normalize(password) ? user : null;
  };

  const updateUser = (userId, userUpdates) =>
    model.updateOne({ _id: userId }, { $set: userUpdates });

  const deleteUser = (userId) => model.findByIdAndDelete(userId);

  return {
    createUser,
    findAllUsers,
    findUsersByRole,
    findUsersByPartialName,
    findUserById,
    findUserByUsername,
    findUserByCredentials,
    updateUser,
    deleteUser,
  };
}
