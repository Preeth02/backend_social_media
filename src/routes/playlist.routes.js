import { Router } from "express";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPlaylistOwner } from "../middlewares/isPlaylistOwner.middleware.js";

const router = Router()

router.route("/create-playlist").post(verifyJWT, createPlaylist)

router.route("/user-playlists/:userId").get(verifyJWT, getUserPlaylists)
router.route("/get-user-playlist/:playlistId").get(verifyJWT, getPlaylistById)

router.route("/add-videoto-playlist/:playlistId/:videoId").patch(verifyJWT, verifyPlaylistOwner, addVideoToPlaylist)
router.route("/remove-video-playlist/:playlistId/:videoId").patch(verifyJWT, verifyPlaylistOwner, removeVideoFromPlaylist)

router.route("/delete-playlist/:playlistId").post(verifyJWT, verifyPlaylistOwner, deletePlaylist)

router.route("/update-playlist/:playlistId").patch(verifyJWT, verifyPlaylistOwner, updatePlaylist)

export default router