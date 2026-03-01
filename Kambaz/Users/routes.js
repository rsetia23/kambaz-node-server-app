import UsersDao from "./dao.js";

export default function UserRoutes(app, db) {
  const dao = UsersDao(db);

  const createUser = async (req, res) => {
    const newUser = await dao.createUser(req.body);
    res.json(newUser);
  };

  const deleteUser = async (req, res) => {
    const status = await dao.deleteUser(req.params.userId);
    if (!status) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (req.session?.currentUser?._id === req.params.userId) {
      req.session.currentUser = null;
    }
    res.json(status);
  };

  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }
    res.json(await dao.findAllUsers());
  };

  const findUserById = async (req, res) => {
    const user = await dao.findUserById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  };

  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    await dao.updateUser(userId, userUpdates);
    const currentUser = req.session.currentUser;
    if (currentUser && currentUser._id === userId) {
      req.session.currentUser = { ...currentUser, ...userUpdates };
    }
    const updatedUser = await dao.findUserById(userId);
    res.json(updatedUser);
  };

  const signup = async (req, res) => {
    const { username } = req.body || {};
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }
    const user = await dao.findUserByUsername(username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const currentUser = await dao.createUser(req.body);
    req.session.currentUser = currentUser;
    res.json(currentUser);
  };

  const signin = async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }
    const currentUser = await dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session.currentUser = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };

  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  const profile = (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };

  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
}
