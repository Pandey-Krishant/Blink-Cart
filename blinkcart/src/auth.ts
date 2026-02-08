import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDB from "./lib/db"
import bcrypt from "bcryptjs"
import User from "./modals/user.model"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB()
        
        const user = await User.findOne({ email: credentials.email })
        if (!user) throw new Error("User does not exist")

        const isMatch = await bcrypt.compare(credentials.password as string, user.password)
        if (!isMatch) throw new Error("Invalid credentials")

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB()
          let dbUser = await User.findOne({ email: user.email })
          
          if (!dbUser) {
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user" // Default role set kar di
            })
          }
          
          user.id = dbUser._id.toString()
          user.role = dbUser.role
          return true
        } catch (error) {
          console.error("Google SignIn Error:", error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        // Ensure email and sub are present on the token for server-side lookups
        token.email = (user as any).email || token.email
        token.sub = token.id || token.sub
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // Ensure email is available on session and role comes from DB in case it was changed after sign-in
        session.user.email = token.email as string
        try {
          await connectDB()
          const dbUser = await User.findById(token.id)
          session.user.role = (dbUser?.role as string) || (token.role as string)
        } catch (error) {
          session.user.role = token.role as string
        }
      }
      return session
    }
  },

  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 24 * 60 * 60 // 2 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
})
