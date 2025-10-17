// import createMedia from "/src/controllers/mediaController.js";
// import insertMediaToDatabase from "/src/services/mediaService.js";

// // Response object mock
// const createResMock = () => ({
//   status: jest.fn().mockReturnThis(),
//   json: jest.fn(),
// });

// // Request objects
// const mockReq_Correct = {
//   body: {
//     container_id: 101,
//     filename: "example_video.mp4",
//     filepath: "/uploads/media/example_video.mp4",
//     file_size: 15000,
//     video_length: 120.5,
//   },
// };

// const mockReq_Incorrect_NullSize = {
//   body: {
//     container_id: 101,
//     filename: "bad_video.mp4",
//     filepath: "/uploads/media/bad_video.mp4",
//     file_size: null,
//     video_length: 80.2,
//   },
// };

// const mockReq_Boundary_AtLimit = {
//   body: {
//     container_id: 101,
//     filename: "boundary_video.mp4",
//     filepath: "/uploads/media/boundary_video.mp4",
//     file_size: 20000,
//     video_length: 300.0,
//   },
// };

// const mockReq_Edge_Zero = {
//   body: {
//     container_id: 101,
//     filename: "zero_size.mp4",
//     filepath: "/uploads/media/zero_size.mp4",
//     file_size: 0,
//     video_length: 0.0,
//   },
// };

// const mockReq_Edge_TooLarge = {
//   body: {
//     container_id: 101,
//     filename: "too_large.mp4",
//     filepath: "/uploads/media/too_large.mp4",
//     file_size: 25000,
//     video_length: 200.0,
//   },
// };

// const insertMedia_Response = {
//   success: true,
//   status: 200,
//   data: null,
// };

// // ----- Jest Test Suite -----
// describe("Media Controller | Creating Media", () => {
//   test("Inserts valid media successfully", async () => {
//     const res = createResMock();

//     response = insertMedia_Response;
//     response.data = mockReq_Correct;
//     insertMediaToDatabase.mockResolveValue(insertMedia_Response);

//     await createMedia(mockReq_Correct, res);

//     expect(insertMediaToDatabase).toHaveBeenCalledTimes(1);
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         message: "Media created successfully.",
//         media: expect.objectContaining({
//           filename: "example_video.mp4",
//           file_size: 15000,
//         }),
//       })
//     );
//   });

//   test("Invalid: null file size", async () => {
//     const res = createResMock();

//     await createMedia(mockReq_Incorrect_NullSize, res);

//     expect(insertMediaToDatabase).toHaveBeenCalledTimes(0);
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         error: "Invalid parameters given.",
//       })
//     );
//   });

//   test("Valid: Created with boundary file size of 20MB", async () => {
//     const res = createResMock();

//     response = insertMedia_Response;
//     response.data = mockReq_Correct;
//     insertMediaToDatabase.mockResolveValue(insertMedia_Response);

//     await mediaController.createMedia(mockReq_Boundary_AtLimit, res);

//     expect(insertMediaToDatabase).toHaveBeenCalledTimes(1);
//     expect(res.status).toHaveBeenCalledWith(200);
//   });

//   test("Invalid: zero file size", async () => {
//     const res = createResMock();

//     await mediaController.createMedia(mockReq_Edge_Zero, res);

//     expect(insertMediaToDatabase).toHaveBeenCalledTimes(0);
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         error: "Invalid parameters given.",
//       })
//     );
//   });

//   test("Invalid file size > 20MB", async () => {
//     const res = createResMock();

//     await mediaController.createMedia(mockReq_Edge_TooLarge, res);

//     expect(insertMediaToDatabase).toHaveBeenCalledTimes(0);
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         error: "Invalid parameters given.",
//       })
//     );
//   });
// });
