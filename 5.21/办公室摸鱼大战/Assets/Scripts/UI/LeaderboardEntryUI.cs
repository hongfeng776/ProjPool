using UnityEngine;
using UnityEngine.UI;
using TMPro;
using OfficeFishing.Database;

namespace OfficeFishing.UI
{
    public class LeaderboardEntryUI : MonoBehaviour
    {
        public TMP_Text rankText;
        public TMP_Text playerNameText;
        public TMP_Text scoreText;
        public TMP_Text dateText;
        public Image backgroundImage;

        public Color firstPlaceColor = new Color(1f, 0.84f, 0f);
        public Color secondPlaceColor = new Color(0.75f, 0.75f, 0.75f);
        public Color thirdPlaceColor = new Color(0.8f, 0.5f, 0.2f);
        public Color defaultColor = new Color(1f, 1f, 1f);

        public void SetData(LeaderboardRepository.LeaderboardEntry entry)
        {
            if (rankText != null)
                rankText.text = entry.Rank.ToString();

            if (playerNameText != null)
                playerNameText.text = entry.PlayerName;

            if (scoreText != null)
                scoreText.text = entry.Score.ToString("N0");

            if (dateText != null)
                dateText.text = entry.PlayedAt.ToString("yyyy/MM/dd");

            if (backgroundImage != null)
            {
                switch (entry.Rank)
                {
                    case 1:
                        backgroundImage.color = firstPlaceColor;
                        break;
                    case 2:
                        backgroundImage.color = secondPlaceColor;
                        break;
                    case 3:
                        backgroundImage.color = thirdPlaceColor;
                        break;
                    default:
                        backgroundImage.color = defaultColor;
                        break;
                }
            }
        }
    }
}
