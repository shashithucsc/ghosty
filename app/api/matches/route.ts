import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET: Fetch all matches for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch matches where user is either user1 or user2
    const { data: matches, error: matchesError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('matched_at', { ascending: false });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({ matches: [], total: 0 }, { status: 200 });
    }

    // Get the other user IDs from matches
    const otherUserIds = matches.map((match) =>
      match.user1_id === userId ? match.user2_id : match.user1_id
    );

    // Fetch conversations to filter out matches that already have active chats
    // Use chats table since there's no separate conversations table
    const { data: existingChats } = await supabaseAdmin
      .from('chats')
      .select('conversation_id, sender_id, receiver_id')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    // Build a set of user IDs that already have conversations with current user
    const usersWithConversations = new Set<string>();
    if (existingChats) {
      existingChats.forEach((chat) => {
        if (chat.sender_id === userId) {
          usersWithConversations.add(chat.receiver_id);
        } else {
          usersWithConversations.add(chat.sender_id);
        }
      });
    }

    // Filter matches to exclude those with existing conversations
    const matchesWithoutChats = matches.filter((match) => {
      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      return !usersWithConversations.has(otherUserId);
    });

    // Get the other user IDs from filtered matches
    const filteredOtherUserIds = matchesWithoutChats.map((match) =>
      match.user1_id === userId ? match.user2_id : match.user1_id
    );

    if (filteredOtherUserIds.length === 0) {
      return NextResponse.json({ matches: [], total: 0 }, { status: 200 });
    }

    // Fetch profiles for matched users
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, anonymous_name, age, gender, university, faculty, bio, height_cm, degree_type, hometown, skin_tone, verified')
      .in('user_id', filteredOtherUserIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Fetch user details for verification status
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, username, verification_status')
      .in('id', filteredOtherUserIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    // Combine match data with profile data (using filtered matches)
    const enrichedMatches = matchesWithoutChats.map((match) => {
      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      const profile = profiles?.find((p) => p.user_id === otherUserId);
      const user = userMap.get(otherUserId);

      // Generate avatar emoji based on gender
      let avatar = '👤';
      if (profile?.gender) {
        if (profile.gender.toLowerCase() === 'male') avatar = '🧑';
        else if (profile.gender.toLowerCase() === 'female') avatar = '👩';
        else avatar = '🙋';
      }

      return {
        matchId: match.id,
        matchedAt: match.matched_at,
        user: {
          id: otherUserId,
          userId: otherUserId,
          anonymousName: profile?.anonymous_name || user?.username || 'Anonymous',
          avatar,
          age: profile?.age || 0,
          gender: profile?.gender || 'Not specified',
          university: profile?.university || 'University',
          faculty: profile?.faculty || 'Not specified',
          bio: profile?.bio || 'No bio yet',
          height: profile?.height_cm,
          degree: profile?.degree_type,
          hometown: profile?.hometown,
          skinTone: profile?.skin_tone,
          interests: [],
          isVerified: profile?.verified || user?.verification_status === 'verified',
          verificationStatus: user?.verification_status || 'unverified',
        },
      };
    });

    return NextResponse.json(
      {
        matches: enrichedMatches,
        total: enrichedMatches.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/matches:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
