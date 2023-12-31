import { useContext, useState } from "react";
import { GeneralContext, darkTheme } from "../App";
import { RoleTyps } from "../components/Navbar";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { AiFillDelete, AiOutlinePhone } from "react-icons/ai";
import EditCard from "./EditCard";
import { Link, useLocation } from "react-router-dom";
import './card.css'

export default function Card({ c, cardEdited, cardDeleted, removeFromFav }) {
  const [cards, setCards] = useState([])
  const [editCard, setEditCard] = useState();
  const location = useLocation();
  const { userRoleTyps, user, snackbar, currentTheme } = useContext(GeneralContext);

  function addFav(cardId) {
    if (window.confirm('Are you sure you want to add this Card to your Favorites?')) {
      localStorage.setItem(`favorite_${user.id}_${cardId}`, 'true');
      fetch(`https://api.shipap.co.il/cards/${cardId}/favorite?token=d29617f9-3431-11ee-b3e9-14dda9d4a5f0`, {
        credentials: 'include',
        method: 'PUT',
      })
        .then(() => {
          snackbar(`Card Number ${cardId} Was Added To your Favorite List`)
        });
    }
  }
  function removeFav(cardId) {
    if (window.confirm('Are you sure you want to remove this Card from your Favorites?')) {
      fetch(`https://api.shipap.co.il/cards/${cardId}/unfavorite?token=d29617f9-3431-11ee-b3e9-14dda9d4a5f0`, {
        credentials: 'include',
        method: 'PUT',
      })
        .then(() => {
          localStorage.removeItem(`favorite_${user.id}_${cardId}`);
          snackbar(`Card Number ${cardId} Was Removed From your Favorite List`)
          if (location.pathname !== '/favcards') {
            return;
          } else {
            removeFromFav(cardId)
          }
        });
    }
  }
  function deleteCard(id) {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    } else {
      fetch(`https://api.shipap.co.il/${userRoleTyps === RoleTyps.admin ? 'admin' : 'business'}/cards/${id}?token=d29617f9-3431-11ee-b3e9-14dda9d4a5f0`, {
        credentials: 'include',
        method: 'DELETE',
      })
        .then(() => {
          setCards(cards.filter((c) => c.id !== id))
          snackbar(`Card Number ${id} Was Deleted From your List`)
          cardDeleted(id);
        });
    }
  }
  function update(c) {
    if (c) {
      const i = cards.findIndex((x) => x.id === c.id);
      cards.splice(i, 1, c);
      setCards([...cards]);
      cardEdited(c); 
    }
    setEditCard();
  }

  return (
    <div key={c.id} className={`card-box ${currentTheme === darkTheme ? 'dark-card' : 'light-card'}`}>
      <Link to={`/business/${c.id}`}>
        <div className="img-box">
          <img src={c.imgUrl ? c.imgUrl : 'https://cdn-icons-png.flaticon.com/512/3014/3014694.png'} alt={c.imgAlt} />
        </div>
        <div className="detail-box">
          <div>
            <h3>{c.title}</h3>
            <p>"{c.subtitle}"</p>
          </div>
          <p><b>Email:</b> {c.email}</p>
          <p><b>Address:</b> {c.street + ' ' + c.city + ' ' + c.state}</p>
          <p><b>Card Number:</b> {c.id}</p>
        </div>
      </Link>
      <div className="btn-box">
        {user ? (
          <>
            {localStorage.getItem(`favorite_${user.id}_${c.id}`) === 'true' ? (
              <VscHeartFilled onClick={() => removeFav(c.id)} className="fav card-icon" />
            ) : (
              <VscHeart onClick={() => addFav(c.id)} className="fav card-icon" />
            )}
            <AiOutlinePhone onClick={() => snackbar(`Phone Number: ${c.title}-${c.phone}`)} className="card-icon" />
            {c.clientId === user.id && (
              <EditCard card={c} cardEdited={update} />
            )}
            {(c.clientId === user.id || userRoleTyps === RoleTyps.admin) && (
              <AiFillDelete className="card-icon" onClick={() => deleteCard(c.id)} />
            )}
          </>
        ) : (
          <AiOutlinePhone onClick={() => snackbar(`Phone Number: ${c.title}-${c.phone}`)} className="card-icon" />
        )}
      </div>

    </div>

  );
}