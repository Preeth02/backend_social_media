import { Router } from "express";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPlaylistOwner } from "../middlewares/isPlaylistOwner.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/create-playlist").post(createPlaylist)

router.route("/user-playlists/:userId").get(getUserPlaylists)
router.route("/get-user-playlist/:playlistId").get(getPlaylistById)

router.route("/add-videoto-playlist/:playlistId/:videoId").patch(verifyPlaylistOwner, addVideoToPlaylist)
router.route("/remove-video-playlist/:playlistId/:videoId").patch(verifyPlaylistOwner, removeVideoFromPlaylist)

router.route("/delete-playlist/:playlistId").post(verifyPlaylistOwner, deletePlaylist)

router.route("/update-playlist/:playlistId").patch(verifyPlaylistOwner, updatePlaylist)

export default router