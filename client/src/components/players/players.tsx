import React from 'react';
import './players.css';
import Window from '../window/window';
import { GameContext } from '../../game-context/game-context';

const COLOR_ARRAY: string[] = [
  'f72585',
  '7209b7',
  '3a0ca3',
  '4361ee',
  '4cc9f0',
];

const Players: React.FC<{ context: GameContext | undefined }> = ({
  context,
}) => {
  return (
    <div className="players__positioner">
      <Window title="Score.png">
        <div className="players">
          {context
            ? context.users.map((user, index) => (
                <div className="players__player" key={index}>
                  <img
                    className="players_player_avatar"
                    src={`https://api.dicebear.com/6.x/pixel-art/svg?seed=${user.user.name}&backgroundColor=${COLOR_ARRAY[index]}&scale=90`}
                  />
                  <span className="players__player__name">
                    {user.user.name}
                  </span>

                  <span className="players__player__score">{user.score}</span>
                </div>
              ))
            : null}
        </div>
      </Window>
    </div>
  );
};

export default Players;
