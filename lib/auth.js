/* Checks who is making an API request.

   The browser sends the user's Supabase session token in the Authorization
   header. Supabase confirms the token is genuine and says who it belongs to.
   Routes then read the user from req.user, never from the request body, so
   nobody can act as another user by sending that user's ID. */

export function getBearerToken(header){
  const match = /^Bearer\s+(\S+)$/i.exec(header || "")
  return match ? match[1] : null
}

export function createRequireUser(supabase){
  return async function requireUser(req, res, next){
    const token = getBearerToken(req.headers.authorization)

    if(!token){
      return res.status(401).json({ error:"Please log in to continue." })
    }

    try{
      const { data, error } = await supabase.auth.getUser(token)

      if(error || !data?.user){
        return res.status(401).json({ error:"Your session has expired. Please log in again." })
      }

      req.user = data.user
      next()

    }catch(error){
      console.error("Auth check failed:", error.message)
      res.status(503).json({ error:"Could not check your login. Try again shortly." })
    }
  }
}
