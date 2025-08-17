export default defineEventHandler(async (event) => {
  try {
    // Clear authentication cookies
    deleteCookie(event, 'access_token', { path: '/' })
    deleteCookie(event, 'refresh_token', { path: '/' })

    return {
      success: true,
      message: 'Logout successful'
    }
  } catch (error) {
    console.error('Logout error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 