import { v4 as uuidv4 } from "uuid";

const normalize = (value) => (value || "").trim().toLowerCase();

export default function UsersDao(db) {
  const createUser = (user) => {
    const username = user.username ?? user.loginId ?? "";
    const password = user.password ?? username;
    const newUser = {
      ...user,
      _id: uuidv4(),
      username,
      loginId: user.loginId ?? username,
      password,
    };
    db.users = [...db.users, newUser];
    return newUser;
  };

  const findAllUsers = () => db.users;

  const findUserById = (userId) => db.users.find((user) => user._id === userId);

  const findUserByUsername = (username) =>
    db.users.find(
      (user) => normalize(user.username ?? user.loginId) === normalize(username)
    );

  const findUserByCredentials = (username, password) =>
    db.users.find((user) => {
      const storedUsername = user.username ?? user.loginId;
      const storedPassword = user.password ?? user.loginId;
      return (
        normalize(storedUsername) === normalize(username) &&
        normalize(storedPassword) === normalize(password)
      );
    });

  const updateUser = (userId, userUpdates) => {
    let updatedUser = null;
    db.users = db.users.map((user) => {
      if (user._id !== userId) return user;
      updatedUser = {
        ...user,
        ...userUpdates,
        _id: userId,
      };
      return updatedUser;
    });
    return updatedUser;
  };

  const deleteUser = (userId) => {
    const beforeCount = db.users.length;
    db.users = db.users.filter((user) => user._id !== userId);
    return beforeCount !== db.users.length;
  };

  return {
    createUser,
    findAllUsers,
    findUserById,
    findUserByUsername,
    findUserByCredentials,
    updateUser,
    deleteUser,
  };
}
